"""
FarmMate RAG Service — Retrieval-Augmented Generation

Uses ChromaDB as vector store (with scikit-learn TF-IDF fallback) to index
agricultural knowledge documents and augment Groq/Gemini LLM responses with
grounded, factual context from ICAR/FAO/Tamil Nadu agriculture sources.
"""
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("farmmate.rag")

# Paths
KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "knowledge"
CHROMA_PERSIST_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "chroma_db"


class RAGService:
    """
    Retrieval-Augmented Generation service.
    Primary: ChromaDB vector store.
    Fallback: In-memory TF-IDF cosine-similarity retriever (zero external DLL dependencies).
    """

    def __init__(self):
        self._collection = None
        self._client = None
        self._initialized = False
        self._mode = "uninitialized"  # "chroma" or "tfidf"
        self._tfidf_docs: List[str] = []
        self._tfidf_metas: List[Dict[str, Any]] = []
        self._tfidf_vectorizer = None
        self._tfidf_matrix = None

    def _ensure_initialized(self) -> bool:
        """Lazy-initialize ChromaDB or TF-IDF fallback."""
        if self._initialized:
            return self._mode != "uninitialized"

        # By default, use fast TF-IDF indexer (zero-delay, 100% reliable on Windows)
        if os.getenv("USE_CHROMADB", "false").lower() == "true":
            try:
                import onnxruntime
                import chromadb
                from chromadb.config import Settings

                persist_dir = str(CHROMA_PERSIST_DIR)
                os.makedirs(persist_dir, exist_ok=True)

                self._client = chromadb.Client(Settings(
                    persist_directory=persist_dir,
                    anonymized_telemetry=False,
                    is_persistent=True,
                ))

                self._collection = self._client.get_or_create_collection(
                    name="farmmate_knowledge",
                    metadata={"hnsw:space": "cosine"},
                )

                if self._collection.count() == 0:
                    logger.info("ChromaDB collection empty — running initial ingestion")
                    self._ingest_knowledge_docs_chroma()
                else:
                    logger.info(f"ChromaDB loaded with {self._collection.count()} chunks")

                self._mode = "chroma"
                self._initialized = True
                return True
            except Exception as e:
                logger.info(f"ChromaDB unavailable ({e}) -> Using fast TF-IDF indexer")

        return self._init_tfidf_fallback()



    def _init_tfidf_fallback(self) -> bool:
        """Initialize in-memory TF-IDF index for fast, zero-dependency semantic search."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer

            if not KNOWLEDGE_DIR.exists():
                logger.warning(f"Knowledge directory not found: {KNOWLEDGE_DIR}")
                self._initialized = True
                return False

            md_files = list(KNOWLEDGE_DIR.glob("*.md"))
            if not md_files:
                logger.warning("No markdown files found in knowledge directory")
                self._initialized = True
                return False

            self._tfidf_docs = []
            self._tfidf_metas = []

            for md_file in md_files:
                try:
                    content = md_file.read_text(encoding="utf-8")
                    source_name = md_file.stem.replace("_", " ").title()
                    chunks = self._chunk_document(content)

                    for i, chunk in enumerate(chunks):
                        self._tfidf_docs.append(chunk)
                        self._tfidf_metas.append({
                            "source": source_name,
                            "file": md_file.name,
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                        })
                except Exception as err:
                    logger.error(f"Error chunking {md_file.name}: {err}")

            if self._tfidf_docs:
                self._tfidf_vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
                self._tfidf_matrix = self._tfidf_vectorizer.fit_transform(self._tfidf_docs)
                self._mode = "tfidf"
                self._initialized = True
                logger.info(f"TF-IDF RAG index built with {len(self._tfidf_docs)} chunks across {len(md_files)} files")
                return True
            else:
                self._initialized = True
                return False

        except Exception as e:
            logger.error(f"TF-IDF initialization failed: {e}")
            self._initialized = True
            return False

    def _chunk_document(self, text: str, chunk_size: int = 500, overlap: int = 80) -> List[str]:
        """Split a document into overlapping chunks by paragraph boundaries."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) < chunk_size:
                current_chunk += "\n\n" + para if current_chunk else para
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else ""
                    current_chunk = overlap_text + "\n\n" + para if overlap_text else para
                else:
                    if len(para) > chunk_size:
                        sentences = para.replace(". ", ".\n").split("\n")
                        sub_chunk = ""
                        for sent in sentences:
                            if len(sub_chunk) + len(sent) < chunk_size:
                                sub_chunk += " " + sent if sub_chunk else sent
                            else:
                                if sub_chunk:
                                    chunks.append(sub_chunk.strip())
                                sub_chunk = sent
                        if sub_chunk:
                            current_chunk = sub_chunk
                    else:
                        current_chunk = para

        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks

    def _ingest_knowledge_docs_chroma(self):
        """Ingest all markdown files into ChromaDB."""
        if not self._collection or not KNOWLEDGE_DIR.exists():
            return

        md_files = list(KNOWLEDGE_DIR.glob("*.md"))
        all_docs, all_ids, all_metadata = [], [], []

        for md_file in md_files:
            try:
                content = md_file.read_text(encoding="utf-8")
                source_name = md_file.stem.replace("_", " ").title()
                chunks = self._chunk_document(content)

                for i, chunk in enumerate(chunks):
                    doc_id = f"{md_file.stem}_chunk_{i:03d}"
                    all_docs.append(chunk)
                    all_ids.append(doc_id)
                    all_metadata.append({
                        "source": source_name,
                        "file": md_file.name,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                    })
            except Exception as e:
                logger.error(f"Error processing {md_file.name}: {e}")

        if all_docs:
            batch_size = 100
            for start in range(0, len(all_docs), batch_size):
                end = min(start + batch_size, len(all_docs))
                self._collection.add(
                    documents=all_docs[start:end],
                    ids=all_ids[start:end],
                    metadatas=all_metadata[start:end],
                )

    def retrieve(self, query: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieve the most relevant knowledge chunks for a query.
        Returns list of dicts with 'content', 'source', 'file', 'relevance_score'.
        """
        if not self._ensure_initialized():
            return []

        # 1. Try Chroma if active
        if self._mode == "chroma" and self._collection:
            try:
                results = self._collection.query(
                    query_texts=[query],
                    n_results=min(n_results, self._collection.count() or 1),
                )
                retrieved = []
                if results and results["documents"] and results["documents"][0]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                    dists = results["distances"][0] if results.get("distances") else [0.0] * len(docs)
                    for doc, meta, dist in zip(docs, metas, dists):
                        retrieved.append({
                            "content": doc,
                            "source": meta.get("source", "ICAR/FAO Guide"),
                            "file": meta.get("file", ""),
                            "relevance_score": round(1.0 - dist, 3),
                        })
                return retrieved
            except Exception as e:
                logger.warning(f"Chroma retrieval failed ({e}), falling back to TF-IDF")
                self._init_tfidf_fallback()

        # 2. TF-IDF retrieval fallback
        if self._mode == "tfidf" and self._tfidf_matrix is not None:
            try:
                from sklearn.metrics.pairwise import cosine_similarity
                q_vec = self._tfidf_vectorizer.transform([query])
                sims = cosine_similarity(q_vec, self._tfidf_matrix)[0]
                top_indices = sims.argsort()[-n_results:][::-1]

                retrieved = []
                for idx in top_indices:
                    score = float(sims[idx])
                    if score > 0.05:  # Relevance threshold
                        retrieved.append({
                            "content": self._tfidf_docs[idx],
                            "source": self._tfidf_metas[idx].get("source", "ICAR/FAO Guide"),
                            "file": self._tfidf_metas[idx].get("file", ""),
                            "relevance_score": round(score, 3),
                        })
                return retrieved
            except Exception as e:
                logger.error(f"TF-IDF retrieval error: {e}")
                return []

        return []

    def build_rag_context(self, query: str, n_results: int = 3) -> str:
        """
        Build a context string from retrieved documents for LLM prompt injection.
        """
        chunks = self.retrieve(query, n_results=n_results)
        if not chunks:
            return ""

        context_parts = []
        sources = set()
        for chunk in chunks:
            context_parts.append(chunk["content"])
            sources.add(chunk["source"])

        sources_str = ", ".join(sources)
        context_block = "\n---\n".join(context_parts)

        return (
            f"--- SUPPLEMENTARY AGRICULTURAL REFERENCE DATA (from {sources_str}) ---\n"
            f"{context_block}\n"
            f"--- Use this reference data to enhance your answer, but ALWAYS provide your own complete, expert agricultural explanation. ---"
        )

    def reingest(self):
        """Force re-ingestion of all knowledge documents."""
        self._initialized = False
        return self._ensure_initialized()

    def get_stats(self) -> Dict[str, Any]:
        """Get current RAG store statistics."""
        if not self._ensure_initialized():
            return {"status": "unavailable", "total_chunks": 0}

        total_chunks = (
            self._collection.count()
            if self._mode == "chroma" and self._collection
            else len(self._tfidf_docs)
        )

        return {
            "status": "active",
            "mode": self._mode,
            "total_chunks": total_chunks,
            "knowledge_dir": str(KNOWLEDGE_DIR),
            "persist_dir": str(CHROMA_PERSIST_DIR),
        }


# Module-level singleton
rag_service = RAGService()
