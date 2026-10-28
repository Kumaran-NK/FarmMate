"""
FastAPI REST API Endpoints for FarmMate Platform
"""
import os
import sys
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from farmmate.services.pdf_service import pdf_service
from dotenv import load_dotenv

# Ensure src is in python path
src_path = Path(__file__).resolve().parent.parent.parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

load_dotenv()

from farmmate.services.crop_service import crop_service
from farmmate.services.et_service import et_service
from farmmate.services.fertilizer_service import fertilizer_service
from farmmate.services.frost_service import frost_service
from farmmate.services.weather_service import weather_service
from farmmate.services.yield_service import yield_service
from farmmate.services.price_service import price_service
from farmmate.utils.cache import cache_manager

from backend.app.schemas.requests import (
    CropRecommendRequest,
    FertilizerRecommendRequest,
    YieldPredictRequest,
    MarketPredictRequest,
    WeatherPredictRequest,
    FrostPredictRequest,
    ET0CalculateRequest,
    ChatMessageRequest
)

router = APIRouter()

# ------------------------------------------------------------------------------
# CROP RECOMMENDATION ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/crop/recommend")
async def recommend_crop(req: CropRecommendRequest) -> Dict[str, Any]:
    try:
        features = req.model_dump()
        result = crop_service.recommend_crop(features)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation failed: {str(e)}")

# ------------------------------------------------------------------------------
# FERTILIZER ADVISORY ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/fertilizer/recommend")
async def recommend_fertilizer(req: FertilizerRecommendRequest) -> Dict[str, Any]:
    try:
        input_data = req.model_dump()
        result = fertilizer_service.recommend_fertilizer(input_data)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer recommendation failed: {str(e)}")

# ------------------------------------------------------------------------------
# YIELD PREDICTION ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/yield/predict")
async def predict_yield(req: YieldPredictRequest) -> Dict[str, Any]:
    try:
        result = yield_service.predict_yield(
            crop=req.crop,
            area_ha=req.area_ha,
            annual_rainfall=req.annual_rainfall,
            pesticides_tonnes=req.pesticides_tonnes,
            avg_temp=req.avg_temp,
            year=req.year
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yield prediction failed: {str(e)}")

# ------------------------------------------------------------------------------
# MARKET PRICE PREDICTION ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/market/predict")
async def predict_market_price(req: MarketPredictRequest) -> Dict[str, Any]:
    try:
        cache_key = f"market:{req.vegetable.lower()}:{req.state.lower()}:{req.market.lower()}:{req.month}"
        cached = await cache_manager.get_json(cache_key)
        if cached:
            return {"status": "success", "data": cached, "cached": True}

        result = price_service.predict_price(
            vegetable=req.vegetable,
            state=req.state,
            market=req.market,
            month=req.month,
            temp=req.temp,
            disaster=req.disaster,
            condition=req.condition,
            baseline_demand=req.baseline_demand
        )
        await cache_manager.set_json(cache_key, result, ttl_seconds=3600)
        return {"status": "success", "data": result, "cached": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market price prediction failed: {str(e)}")

# ------------------------------------------------------------------------------
# WEATHER FORECAST & RAIN AI ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/weather/predict")
async def predict_weather(req: WeatherPredictRequest) -> Dict[str, Any]:
    try:
        if req.lat is not None and req.lon is not None:
            cache_key = f"weather:coords:{round(req.lat, 3)}:{round(req.lon, 3)}"
        else:
            cache_key = f"weather:{req.city_name.lower().strip()}"
        cached = await cache_manager.get_json(cache_key)
        if cached:
            return {"status": "success", "data": cached, "cached": True}

        result = weather_service.predict_weather(city_name=req.city_name, lat=req.lat, lon=req.lon)
        await cache_manager.set_json(cache_key, result, ttl_seconds=900)
        return {"status": "success", "data": result, "cached": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather forecast failed: {str(e)}")

# ------------------------------------------------------------------------------
# FROST RISK EVALUATION ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/frost/predict")
async def predict_frost(req: FrostPredictRequest) -> Dict[str, Any]:
    try:
        input_data = req.model_dump()
        result = frost_service.predict_frost_risk(input_data)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frost evaluation failed: {str(e)}")

# ------------------------------------------------------------------------------
# EVAPOTRANSPIRATION (ET0) ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/et0/calculate")
async def calculate_et0(req: ET0CalculateRequest) -> Dict[str, Any]:
    try:
        result = et_service.get_et_forecast(lat=req.lat, lon=req.lon, crop_name=req.crop_name)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ET0 calculation failed: {str(e)}")

# ------------------------------------------------------------------------------
# EXECUTIVE PDF ADVISORY REPORT ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/report/pdf")
async def generate_pdf_report(payload: Dict[str, Any]):
    try:
        import io
        pdf_bytes = pdf_service.generate_advisory_pdf(payload)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=FarmMate_Advisory_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF report generation failed: {str(e)}")

# ------------------------------------------------------------------------------
# AI ASSISTANT ENDPOINT — Dual Provider: Groq + Gemini Fallback
# ------------------------------------------------------------------------------
@router.post("/chat")
async def chat_assistant(req: ChatMessageRequest) -> Dict[str, Any]:
    import logging
    import traceback
    logger = logging.getLogger("farmmate.chat")

    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()

    has_groq = bool(groq_api_key) and groq_api_key != "your_groq_api_key_here"
    has_gemini = bool(gemini_api_key) and gemini_api_key != "your_gemini_api_key_here"

    logger.info(f"Chat request: has_groq={has_groq}, has_gemini={has_gemini}, message='{req.message[:80]}...'")

    if not has_groq and not has_gemini:
        logger.warning("No AI API keys configured (GROQ_API_KEY / GEMINI_API_KEY)")
        return {
            "status": "break",
            "reply": "No AI provider configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your .env file."
        }

    # Build system prompt — LLM should ALWAYS generate its own comprehensive answer
    system_prompt = (
        "You are FarmMate AI, an expert agricultural assistant for Indian farmers. "
        "You have deep expertise in crop science, soil management, fertilizers, irrigation, "
        "pest control, weather interpretation, and market pricing. "
        "ALWAYS generate a comprehensive, helpful answer using your own agricultural knowledge. "
        "You support English, Tamil, Hindi, and Tanglish (Tamil-English mix). "
        "If someone asks 'Tomorrow rain varuma?', respond naturally in the same language. "
        "Keep responses practical, structured with bullet points when helpful, and actionable. "
        "If farm context is provided (location, active crop, weather), use it naturally in your answer."
    )

    if req.context:
        context_str = "\n".join([f"- {k}: {v}" for k, v in req.context.items() if v])
        system_prompt += f"\n\nCURRENT FARM CONTEXT:\n{context_str}"

    # --- RAG: Retrieve supplementary agricultural knowledge ---
    try:
        from farmmate.services.rag_service import rag_service
        rag_context = rag_service.build_rag_context(req.message, n_results=3)
        if rag_context:
            system_prompt += (
                f"\n\n--- SUPPLEMENTARY REFERENCE DATA (use if relevant, but always give your own expert answer too) ---\n"
                f"{rag_context}"
            )
            logger.info("RAG context injected as supplementary reference")
    except Exception as rag_err:
        logger.debug(f"RAG skipped (non-critical): {rag_err}")

    # Build message history for the LLM
    chat_messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history[-6:]:
        chat_messages.append({"role": msg.role, "content": msg.content})
    chat_messages.append({"role": "user", "content": req.message})

    reply_text = None
    provider_used = None

    # --- ATTEMPT 1: Groq ---
    if has_groq:
        try:
            import groq
            client = groq.Groq(api_key=groq_api_key)

            # Verified working Groq models
            env_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip()
            candidate_models = [
                env_model,
                "openai/gpt-oss-20b",
                "openai/gpt-oss-120b",
                "qwen/qwen3.8-27b",
                "allam-2-7b",
            ]
            # De-duplicate preserving order
            seen = set()
            models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]

            for model_name in models_to_try:
                try:
                    logger.info(f"Trying Groq model: {model_name}")
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=chat_messages,
                        temperature=0.7,
                        max_tokens=800
                    )
                    reply_text = completion.choices[0].message.content
                    provider_used = f"Groq ({model_name})"
                    logger.info(f"✅ Groq model '{model_name}' responded successfully")
                    break
                except Exception as err:
                    logger.warning(f"❌ Groq model '{model_name}' failed: {err}")
                    continue

        except ImportError:
            logger.error("groq package not installed! Run: pip install groq")
        except Exception as e:
            logger.error(f"Groq provider error: {e}\n{traceback.format_exc()}")

    # --- ATTEMPT 2: Google Gemini fallback ---
    if has_gemini and not reply_text:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_api_key)

            # Verified working Gemini models
            gemini_models = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-pro"]

            for gm_name in gemini_models:
                try:
                    logger.info(f"Trying Gemini model: {gm_name}")
                    model = genai.GenerativeModel(
                        model_name=gm_name,
                        system_instruction=system_prompt,
                    )

                    # Build Gemini-compatible history
                    gemini_history = []
                    for msg in req.history[-6:]:
                        gemini_history.append({
                            "role": "user" if msg.role == "user" else "model",
                            "parts": [msg.content],
                        })

                    chat = model.start_chat(history=gemini_history)
                    response = chat.send_message(req.message)
                    reply_text = response.text
                    provider_used = f"Gemini ({gm_name})"
                    logger.info(f"✅ Gemini model '{gm_name}' responded successfully")
                    break
                except Exception as err:
                    logger.warning(f"❌ Gemini model '{gm_name}' failed: {err}")
                    continue

        except ImportError:
            logger.error("google-generativeai not installed! Run: pip install google-generativeai")
        except Exception as e:
            logger.error(f"Gemini provider error: {e}\n{traceback.format_exc()}")

    if reply_text:
        return {"status": "success", "reply": reply_text, "provider": provider_used}
    else:
        logger.error("⚠️ ALL AI providers exhausted — no response generated")
        return {
            "status": "break",
            "reply": "I'm having trouble connecting to the AI service right now. Please check your API keys in the .env file and try again. Your crop, weather, fertilizer and irrigation tools are still available."
        }

# ------------------------------------------------------------------------------
# CROP CATALOG METADATA ENDPOINT
# ------------------------------------------------------------------------------
@router.get("/crops/catalog")
async def get_crops_catalog() -> Dict[str, Any]:
    """Return catalog of crops with descriptions, optimal conditions, and images."""
    catalog = {
        "Rice": {
            "name": "Rice (Paddy)",
            "description": "Staple cereal grain requiring tropical warm climate and substantial water for submerged growth.",
            "temperature_range": "20°C - 38°C",
            "rainfall_range": "1000 - 2500 mm",
            "soil_type": "Clayey / Loamy",
            "water_need": "High (1200 mm)",
            "image": "https://images.unsplash.com/photo-1536637175371-cc52b364817a?q=80&w=600&auto=format&fit=crop"
        },
        "Maize": {
            "name": "Maize (Corn)",
            "description": "Versatile cereal crop used for grain, fodder, and industrial products requiring warm weather and well-drained soil.",
            "temperature_range": "18°C - 32°C",
            "rainfall_range": "500 - 800 mm",
            "soil_type": "Loamy / Well-drained",
            "water_need": "Moderate (500 mm)",
            "image": "https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=600&auto=format&fit=crop"
        },
        "Wheat": {
            "name": "Wheat",
            "description": "Rabi crop grown in cool temperate climates requiring bright sunshine during ripening.",
            "temperature_range": "12°C - 25°C",
            "rainfall_range": "450 - 650 mm",
            "soil_type": "Clay Loam / Silt Loam",
            "water_need": "Moderate (450 mm)",
            "image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop"
        },
        "Coffee": {
            "name": "Coffee",
            "description": "Perennial cash crop requiring humid tropical highlands with organic, fertile soil.",
            "temperature_range": "15°C - 28°C",
            "rainfall_range": "1500 - 2000 mm",
            "soil_type": "Deep Volcanic / Organic Loam",
            "water_need": "High (1600 mm)",
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"
        },
        "Cotton": {
            "name": "Cotton",
            "description": "Major fiber crop growing best in warm climates with deep black cotton soils.",
            "temperature_range": "21°C - 35°C",
            "rainfall_range": "500 - 1000 mm",
            "soil_type": "Black Soil / Regur",
            "water_need": "Moderate (700 mm)",
            "image": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?q=80&w=600&auto=format&fit=crop"
        },
        "Apple": {
            "name": "Apple",
            "description": "Temperate fruit crop requiring winter chilling hours and moist, rich mountain soils.",
            "temperature_range": "4°C - 21°C",
            "rainfall_range": "1000 - 1250 mm",
            "soil_type": "Loamy / Well-drained Mountain Soil",
            "water_need": "Moderate (1000 mm)",
            "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"
        },
        "Tomato": {
            "name": "Tomato",
            "description": "High-value vegetable crop requiring warm conditions and balanced nitrogen-phosphorus nutrition.",
            "temperature_range": "18°C - 30°C",
            "rainfall_range": "400 - 600 mm",
            "soil_type": "Well-drained Sandy Loam",
            "water_need": "Moderate (500 mm)",
            "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop"
        },
        "Potato": {
            "name": "Potato",
            "description": "Tuber crop thriving in cool weather and loose, friable soils rich in potassium.",
            "temperature_range": "15°C - 24°C",
            "rainfall_range": "500 - 700 mm",
            "soil_type": "Loose Sandy Loam",
            "water_need": "Moderate (600 mm)",
            "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop"
        }
    }
    return {"status": "success", "data": catalog}
