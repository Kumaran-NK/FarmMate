"""
FarmMate FastAPI Production Application Entrypoint
"""
import sys
from pathlib import Path

# Add src and backend to python path for modular imports
root_path = Path(__file__).resolve().parent.parent.parent
src_path = root_path / "src"
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title="🌾 FarmMate Agricultural Intelligence API",
    description="Full-stack machine learning, weather, ET0, market price, frost prediction & Groq AI assistant endpoints.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": "FarmMate Agricultural Intelligence Platform",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FarmMate API"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
