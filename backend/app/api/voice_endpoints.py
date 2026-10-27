"""
FarmMate Voice & WebSocket API Endpoints

Provides:
- POST /api/voice/process — Process voice transcription text (classify intent, call API, return spoken response)
- WebSocket /api/voice/ws — Real-time voice streaming with live transcription + intent processing
"""
import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field

from dotenv import load_dotenv

# Ensure imports work
src_path = Path(__file__).resolve().parent.parent.parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

load_dotenv()

from farmmate.services.voice_service import voice_intent_service
from farmmate.services.crop_service import crop_service
from farmmate.services.et_service import et_service
from farmmate.services.fertilizer_service import fertilizer_service
from farmmate.services.frost_service import frost_service
from farmmate.services.weather_service import weather_service
from farmmate.services.yield_service import yield_service
from farmmate.services.price_service import price_service
from farmmate.utils.cache import cache_manager

logger = logging.getLogger("farmmate.voice.api")

voice_router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class VoiceProcessRequest(BaseModel):
    transcription: str = Field(description="Transcribed text from voice input")
    language: str = Field(default="en", description="Detected language (en/ta/hi)")
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Current farm context (location, active crop, weather)"
    )


class VoiceProcessResponse(BaseModel):
    intent: str
    confidence: float
    detected_language: str
    spoken_response: str
    raw_data: Optional[Dict[str, Any]] = None
    params_used: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------------------------
# Intent-to-API router — calls the matching FarmMate service
# ---------------------------------------------------------------------------
async def _execute_intent(intent: str, params: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Route an intent to the corresponding FarmMate service and return the result."""
    try:
        if intent == "weather_check":
            city = params.get("city_name")
            if not city and context:
                loc = context.get("location", "")
                city = loc.split(",")[0].strip() if loc else "Chennai"
            city = city or "Chennai"

            cache_key = f"weather:{city.lower().strip()}"
            cached = await cache_manager.get_json(cache_key)
            if cached:
                return {"status": "success", "data": cached, "cached": True}

            result = weather_service.predict_weather(city_name=city)
            await cache_manager.set_json(cache_key, result, ttl_seconds=900)
            return {"status": "success", "data": result}

        elif intent == "crop_recommend":
            features = {
                "N": params.get("N", 90.0),
                "P": params.get("P", 42.0),
                "K": params.get("K", 43.0),
                "temperature": params.get("temperature", 20.8),
                "humidity": params.get("humidity", 82.0),
                "ph": params.get("ph", 6.5),
                "rainfall": params.get("rainfall", 202.9),
            }
            result = crop_service.recommend_crop(features)
            return {"status": "success", "data": result}

        elif intent == "fertilizer_recommend":
            input_data = {
                "temperature": params.get("temperature", 26.0),
                "humidity": params.get("humidity", 52.0),
                "moisture": params.get("moisture", 38.0),
                "soil_type": params.get("soil_type", "Loamy Soil"),
                "crop_type": params.get("crop_type", "Wheat"),
                "nitrogen": params.get("nitrogen", 37.0),
                "potassium": params.get("potassium", 20.0),
                "phosphorous": params.get("phosphorous", 20.0),
            }
            result = fertilizer_service.recommend_fertilizer(input_data)
            return {"status": "success", "data": result}

        elif intent == "water_management":
            lat = params.get("lat", 13.0827)
            lon = params.get("lon", 80.2707)
            crop_name = params.get("crop_name", "tomatoes")

            # Try to get lat/lon from context
            if context:
                lat = context.get("lat", lat)
                lon = context.get("lon", lon)

            result = et_service.get_et_forecast(lat=lat, lon=lon, crop_name=crop_name)
            return {"status": "success", "data": result}

        elif intent == "yield_predict":
            result = yield_service.predict_yield(
                crop=params.get("crop", "Maize"),
                area_ha=params.get("area_ha", 5.0),
                annual_rainfall=params.get("annual_rainfall", 1200.0),
                pesticides_tonnes=params.get("pesticides_tonnes", 10.0),
                avg_temp=params.get("avg_temp", 25.0),
                year=params.get("year", 2024),
            )
            return {"status": "success", "data": result}

        elif intent == "market_price":
            vegetable = params.get("vegetable", "Tomato")
            state = params.get("state", "Tamil Nadu")
            market = params.get("market", "Chennai")
            month = params.get("month", "October")

            result = price_service.predict_price(
                vegetable=vegetable,
                state=state,
                market=market,
                month=month,
                temp=params.get("temp", 25.0),
                disaster=params.get("disaster", "no"),
                condition=params.get("condition", "fresh"),
                baseline_demand=params.get("baseline_demand", 100),
            )
            return {"status": "success", "data": result}

        elif intent == "frost_risk":
            city = params.get("city", "Shimla")
            input_data = {
                "city": city,
                "temperature": params.get("temperature", 2.0),
                "humidity": params.get("humidity", 85.0),
                "wind_speed": params.get("wind_speed", 1.5),
                "cloud_cover": params.get("cloud_cover", 10.0),
            }
            result = frost_service.predict_frost_risk(input_data)
            return {"status": "success", "data": result}

        elif intent == "general_chat":
            # Route to the Groq chat endpoint
            groq_api_key = os.getenv("GROQ_API_KEY")
            if not groq_api_key or groq_api_key == "your_groq_api_key_here":
                return {
                    "status": "success",
                    "data": {"reply": "I can help with crops, weather, fertilizers, and irrigation. Please ask me a specific farming question!"},
                }

            gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()

            system_prompt = (
                "You are FarmMate AI, an expert agricultural assistant. "
                "Give concise, spoken-friendly responses (2-3 sentences max). "
                "Support Tamil and English."
            )
            if context:
                ctx_str = ", ".join(f"{k}: {v}" for k, v in context.items() if v)
                system_prompt += f"\nFarm context: {ctx_str}"

            message_text = params.get("message", "Hello")
            reply = None

            # Try Groq
            if groq_api_key and groq_api_key != "your_groq_api_key_here":
                try:
                    import groq
                    client = groq.Groq(api_key=groq_api_key)
                    for m in [os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"), "openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b"]:
                        try:
                            completion = client.chat.completions.create(
                                model=m,
                                messages=[
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": message_text},
                                ],
                                temperature=0.7,
                                max_tokens=300,
                            )
                            reply = completion.choices[0].message.content
                            break
                        except Exception:
                            continue
                except Exception as e:
                    logger.debug(f"Voice Groq chat error: {e}")

            # Try Gemini fallback
            if not reply and gemini_api_key and gemini_api_key != "your_gemini_api_key_here":
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=gemini_api_key)
                    for gm in ["gemini-2.5-flash", "gemini-3.8-flash"]:
                        try:
                            model = genai.GenerativeModel(model_name=gm, system_instruction=system_prompt)
                            res = model.generate_content(message_text)
                            reply = res.text
                            break
                        except Exception:
                            continue
                except Exception as e:
                    logger.debug(f"Voice Gemini chat error: {e}")

            if reply:
                return {"status": "success", "data": {"reply": reply}}
            else:
                return {
                    "status": "success",
                    "data": {"reply": "I'm having trouble connecting right now. Please try asking about crops, weather, or fertilizers directly."},
                }


        else:
            return {
                "status": "success",
                "data": {"reply": "I didn't quite catch that. Could you ask about weather, crops, fertilizers, water, yield, or market prices?"},
            }

    except Exception as e:
        logger.error(f"Intent execution error for '{intent}': {e}")
        return {
            "status": "error",
            "data": {"reply": f"I understood your request about {intent.replace('_', ' ')}, but encountered an error processing it. Please try again."},
        }


# ---------------------------------------------------------------------------
# REST endpoint — process text transcription
# ---------------------------------------------------------------------------
@voice_router.post("/voice/process", response_model=VoiceProcessResponse)
async def process_voice(req: VoiceProcessRequest):
    """
    Process a voice transcription: classify intent → call API → return spoken response.
    This is the primary voice pipeline endpoint.
    """
    try:
        # Step 1: Classify intent
        classification = await voice_intent_service.classify_intent(
            transcription=req.transcription,
            farm_context=req.context,
        )

        intent = classification.get("intent", "general_chat")
        confidence = classification.get("confidence", 0.5)
        detected_lang = classification.get("detected_language", req.language)
        params = classification.get("params", {})

        # For general_chat, ensure the message is set
        if intent == "general_chat" and "message" not in params:
            params["message"] = req.transcription

        # Step 2: Execute intent against FarmMate services
        api_result = await _execute_intent(intent, params, req.context)

        # Step 3: Format response for TTS
        spoken = voice_intent_service.format_response_for_speech(
            intent=intent,
            api_response=api_result,
            language=detected_lang,
        )

        return VoiceProcessResponse(
            intent=intent,
            confidence=confidence,
            detected_language=detected_lang,
            spoken_response=spoken,
            raw_data=api_result.get("data"),
            params_used=params,
        )

    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")


# ---------------------------------------------------------------------------
# WebSocket endpoint — real-time voice streaming
# ---------------------------------------------------------------------------
@voice_router.websocket("/voice/ws")
async def voice_websocket(websocket: WebSocket):
    """
    WebSocket for real-time voice interaction.

    Client sends JSON messages:
        { "type": "transcription", "text": "...", "language": "en", "context": {...} }
        { "type": "ping" }

    Server responds with JSON:
        { "type": "intent_result", "data": { ...VoiceProcessResponse... } }
        { "type": "error", "message": "..." }
        { "type": "pong" }
    """
    await websocket.accept()
    logger.info("Voice WebSocket connection opened")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            msg_type = msg.get("type", "")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg_type == "transcription":
                text = msg.get("text", "").strip()
                if not text:
                    await websocket.send_json({"type": "error", "message": "Empty transcription"})
                    continue

                language = msg.get("language", "en")
                context = msg.get("context")

                # Classify intent
                classification = await voice_intent_service.classify_intent(
                    transcription=text,
                    farm_context=context,
                )

                intent = classification.get("intent", "general_chat")
                params = classification.get("params", {})
                detected_lang = classification.get("detected_language", language)

                if intent == "general_chat" and "message" not in params:
                    params["message"] = text

                # Execute intent
                api_result = await _execute_intent(intent, params, context)

                # Format for speech
                spoken = voice_intent_service.format_response_for_speech(
                    intent=intent,
                    api_response=api_result,
                    language=detected_lang,
                )

                await websocket.send_json({
                    "type": "intent_result",
                    "data": {
                        "intent": intent,
                        "confidence": classification.get("confidence", 0.5),
                        "detected_language": detected_lang,
                        "spoken_response": spoken,
                        "raw_data": api_result.get("data"),
                        "params_used": params,
                    },
                })

            else:
                await websocket.send_json({"type": "error", "message": f"Unknown message type: {msg_type}"})

    except WebSocketDisconnect:
        logger.info("Voice WebSocket connection closed")
    except Exception as e:
        logger.error(f"Voice WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
