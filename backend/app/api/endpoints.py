"""
FastAPI REST API Endpoints for FarmMate Platform
"""
import os
import sys
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
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
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market price prediction failed: {str(e)}")

# ------------------------------------------------------------------------------
# WEATHER FORECAST & RAIN AI ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/weather/predict")
async def predict_weather(req: WeatherPredictRequest) -> Dict[str, Any]:
    try:
        result = weather_service.predict_weather(city_name=req.city_name)
        return {"status": "success", "data": result}
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
# GROQ-POWERED AI ASSISTANT ENDPOINT
# ------------------------------------------------------------------------------
@router.post("/chat")
async def chat_assistant(req: ChatMessageRequest) -> Dict[str, Any]:
    import logging
    logger = logging.getLogger("farmmate.chat")

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        logger.warning("GROQ_API_KEY not configured — returning break status")
        return {
            "status": "break",
            "reply": "Our farming assistant is taking a short break. Your crop, weather, fertilizer and irrigation tools are still available."
        }

    # Free-tier Groq model options in preference order
    env_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()
    candidate_models = [env_model, "qwen/qwen3.8-27b", "groq/compound-mini", "allam-2-7b"]
    # De-duplicate preserving order
    seen = set()
    models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]

    try:
        import groq
        client = groq.Groq(api_key=groq_api_key)
        
        system_prompt = (
            "You are FarmMate AI, an expert agricultural assistant designed to empower farmers and agronomists "
            "with data-driven decision support. You speak in a helpful, respectful, and practical manner. "
            "You support questions in English, Tamil (e.g. 'Tomorrow rain varuma?'), and other regional Indian languages. "
            "When farm context is provided (such as active crop recommendation, location, or weather), incorporate it naturally. "
            "Keep your responses structured, clear, and actionable for real-world farming. Avoid technical ML jargon unless requested."
        )

        if req.context:
            context_str = "\n".join([f"- {k}: {v}" for k, v in req.context.items() if v])
            system_prompt += f"\n\nCURRENT FARM CONTEXT:\n{context_str}"

        messages = [{"role": "system", "content": system_prompt}]
        for msg in req.history[-6:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": req.message})

        reply_text = None
        last_error = None
        for model_name in models_to_try:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=800
                )
                reply_text = completion.choices[0].message.content
                logger.info(f"Groq model '{model_name}' responded successfully")
                break
            except Exception as err:
                last_error = err
                logger.warning(f"Groq model '{model_name}' failed: {err}")
                continue

        if reply_text:
            return {"status": "success", "reply": reply_text}
        else:
            logger.error(f"All Groq models exhausted. Last error: {last_error}")
            return {
                "status": "break",
                "reply": "Our farming assistant is taking a short break. Your crop, weather, fertilizer and irrigation tools are still available."
            }

    except Exception as e:
        logger.error(f"Groq Chatbot Execution Error: {e}")
        return {
            "status": "break",
            "reply": "Our farming assistant is taking a short break. Your crop, weather, fertilizer and irrigation tools are still available."
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
