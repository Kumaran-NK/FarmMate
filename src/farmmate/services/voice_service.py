"""
FarmMate Voice Intent Classification Service

Uses Groq LLM to classify natural language voice transcriptions into
structured API intents with extracted parameters. Supports English,
Tamil, and mixed-language queries (Tanglish).
"""
import os
import json
import logging
from typing import Dict, Any, Optional, Tuple

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("farmmate.voice")


# ---------------------------------------------------------------------------
# Intent definitions — every intent maps to an existing FarmMate API endpoint
# ---------------------------------------------------------------------------
INTENT_SCHEMA = {
    "weather_check": {
        "description": "Check current weather, rain probability, or forecast",
        "endpoint": "/api/weather/predict",
        "required_params": ["city_name"],
        "examples": [
            "What's the weather in Chennai?",
            "Tomorrow rain varuma?",
            "Will it rain today?",
            "நாளை மழை வருமா?",
        ],
    },
    "crop_recommend": {
        "description": "Recommend crops based on soil and climate data",
        "endpoint": "/api/crop/recommend",
        "required_params": [],
        "optional_params": [
            "N",
            "P",
            "K",
            "temperature",
            "humidity",
            "ph",
            "rainfall",
        ],
        "examples": [
            "What crop should I grow?",
            "My soil has nitrogen 90, phosphorus 42, pH 6.5",
            "Recommend a crop for my field",
            "என் நிலத்தில் எந்த பயிர் நடலாம்?",
        ],
    },
    "fertilizer_recommend": {
        "description": "Get fertilizer recommendation for a crop",
        "endpoint": "/api/fertilizer/recommend",
        "required_params": [],
        "optional_params": [
            "crop_type",
            "soil_type",
            "nitrogen",
            "potassium",
            "phosphorous",
            "temperature",
            "humidity",
            "moisture",
        ],
        "examples": [
            "What fertilizer should I use for wheat?",
            "Explain my fertilizer recommendation",
            "கோதுமைக்கு எந்த உரம் பயன்படுத்தணும்?",
        ],
    },
    "water_management": {
        "description": "Calculate irrigation / water needs (ET0)",
        "endpoint": "/api/et0/calculate",
        "required_params": [],
        "optional_params": ["crop_name", "lat", "lon"],
        "examples": [
            "How much water does my crop need today?",
            "Calculate irrigation for tomato",
            "தக்காளிக்கு எவ்வளவு தண்ணீர் தேவை?",
        ],
    },
    "yield_predict": {
        "description": "Predict harvest yield for a crop",
        "endpoint": "/api/yield/predict",
        "required_params": [],
        "optional_params": [
            "crop",
            "area_ha",
            "annual_rainfall",
            "pesticides_tonnes",
            "avg_temp",
        ],
        "examples": [
            "How much yield can I expect?",
            "Predict harvest for maize on 5 hectares",
            "எவ்வளவு மகசூல் எதிர்பார்க்கலாம்?",
        ],
    },
    "market_price": {
        "description": "Forecast wholesale market (mandi) prices",
        "endpoint": "/api/market/predict",
        "required_params": [],
        "optional_params": ["vegetable", "state", "market", "month"],
        "examples": [
            "What is the price of tomato in Chennai market?",
            "Forecast market price for potato",
            "தக்காளி சந்தை விலை என்ன?",
        ],
    },
    "frost_risk": {
        "description": "Check frost / cold wave risk for a location",
        "endpoint": "/api/frost/predict",
        "required_params": [],
        "optional_params": ["city", "temperature", "humidity", "wind_speed"],
        "examples": [
            "Is there frost risk tonight?",
            "Check cold wave alert for Shimla",
        ],
    },
    "general_chat": {
        "description": "General agricultural question or conversation",
        "endpoint": "/api/chat",
        "required_params": ["message"],
        "examples": [
            "How can I improve soil quality?",
            "What are organic farming practices?",
            "நெல் சாகுபடி முறைகள்",
        ],
    },
}


class VoiceIntentService:
    """Classifies voice transcriptions into structured API intents using Groq LLM."""

    def __init__(self):
        self._groq_client = None

    def _get_groq_client(self):
        if self._groq_client is None:
            try:
                import groq

                api_key = os.getenv("GROQ_API_KEY")
                if api_key and api_key != "your_groq_api_key_here":
                    self._groq_client = groq.Groq(api_key=api_key)
            except ImportError:
                logger.warning("groq package not installed")
        return self._groq_client

    def _build_classification_prompt(self) -> str:
        """Build the system prompt for intent classification."""
        intent_descriptions = []
        for intent_name, config in INTENT_SCHEMA.items():
            params = config.get("optional_params", config.get("required_params", []))
            examples = config.get("examples", [])
            intent_descriptions.append(
                f'- "{intent_name}": {config["description"]}. '
                f'Extractable params: {params}. '
                f'Examples: {examples[:2]}'
            )

        intents_block = "\n".join(intent_descriptions)

        return f"""You are an agricultural voice intent classifier for the FarmMate platform.
Your job is to classify user voice transcriptions into ONE of these intents and extract relevant parameters.

AVAILABLE INTENTS:
{intents_block}

RULES:
1. Respond ONLY with valid JSON — no markdown, no explanation.
2. If the user mentions a specific city/location, extract it as "city_name" or "city".
3. If the user mentions soil values (nitrogen, phosphorus, potassium, pH), extract them numerically.
4. If the user mentions a crop name, extract it as "crop_name" or "crop_type" or "crop" depending on the intent.
5. Support Tamil, Hindi, Tanglish (mixed Tamil-English), and English inputs.
6. If you cannot determine a specific intent, default to "general_chat".
7. Detect the language of the input and include it as "detected_language" (en/ta/hi).

OUTPUT FORMAT (strict JSON):
{{
  "intent": "<intent_name>",
  "confidence": <0.0-1.0>,
  "detected_language": "<en|ta|hi|tanglish>",
  "params": {{ ... extracted parameters ... }},
  "spoken_response_hint": "<brief natural language summary of what the user wants>"
}}"""

    async def classify_intent(
        self,
        transcription: str,
        farm_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Classify a voice transcription into a structured intent.

        Args:
            transcription: The text from STT.
            farm_context: Optional dict with current location, crop, weather.

        Returns:
            Dict with intent, confidence, params, detected_language.
        """
        client = self._get_groq_client()

        if not client:
            return self._fallback_classify(transcription, farm_context)

        system_prompt = self._build_classification_prompt()

        user_msg = f"Voice transcription: \"{transcription}\""
        if farm_context:
            ctx_str = ", ".join(
                f"{k}: {v}" for k, v in farm_context.items() if v
            )
        # Prepare candidate Groq models
        groq_candidates = [
            os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip(),
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
            "qwen/qwen3.8-27b",
            "allam-2-7b",
        ]
        seen = set()
        models_to_try = [m for m in groq_candidates if not (m in seen or seen.add(m))]

        # ATTEMPT 1: Groq
        if client:
            for model_name in models_to_try:
                try:
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_msg},
                        ],
                        temperature=0.1,
                        max_tokens=400,
                    )

                    raw = completion.choices[0].message.content.strip()
                    if raw.startswith("```"):
                        raw = raw.split("```")[1]
                        if raw.startswith("json"):
                            raw = raw[4:]
                        raw = raw.strip()

                    if "<think>" in raw:
                        import re
                        raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()

                    result = json.loads(raw)
                    result.setdefault("intent", "general_chat")
                    result.setdefault("confidence", 0.8)
                    result.setdefault("detected_language", "en")
                    result.setdefault("params", {})
                    result.setdefault("spoken_response_hint", transcription)

                    logger.info(
                        f"Voice intent classified by Groq ({model_name}): {result['intent']} "
                        f"(confidence={result['confidence']}, lang={result['detected_language']})"
                    )
                    return result
                except Exception as err:
                    logger.debug(f"Groq intent classification failed on {model_name}: {err}")
                    continue

        # ATTEMPT 2: Gemini fallback
        gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if gemini_api_key and gemini_api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_api_key)
                for gm in ["gemini-2.5-flash", "gemini-3.8-flash"]:
                    try:
                        g_model = genai.GenerativeModel(
                            model_name=gm,
                            system_instruction=system_prompt,
                        )
                        response = g_model.generate_content(user_msg)
                        raw = response.text.strip()
                        if raw.startswith("```"):
                            raw = raw.split("```")[1]
                            if raw.startswith("json"):
                                raw = raw[4:]
                            raw = raw.strip()
                        result = json.loads(raw)
                        result.setdefault("intent", "general_chat")
                        result.setdefault("confidence", 0.8)
                        result.setdefault("detected_language", "en")
                        result.setdefault("params", {})
                        result.setdefault("spoken_response_hint", transcription)

                        logger.info(f"Voice intent classified by Gemini ({gm}): {result['intent']}")
                        return result
                    except Exception as g_err:
                        logger.debug(f"Gemini intent classification failed on {gm}: {g_err}")
                        continue
            except Exception as e:
                logger.debug(f"Gemini intent fallback error: {e}")

        # Fallback to keyword matching
        return self._fallback_classify(transcription, farm_context)

    def _fallback_classify(

        self,
        transcription: str,
        farm_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Keyword-based fallback classifier when Groq is unavailable."""
        text = transcription.lower().strip()

        # Simple keyword matching
        weather_kw = [
            "weather", "rain", "forecast", "temperature", "மழை",
            "வானிலை", "varuma", "cloud", "humid",
        ]
        crop_kw = [
            "crop", "grow", "plant", "recommend", "பயிர்",
            "நடலாம்", "soil", "nitrogen", "phosphorus",
        ]
        fertilizer_kw = [
            "fertilizer", "urea", "npk", "உரம்", "manure",
            "nutrient",
        ]
        water_kw = [
            "water", "irrigation", "நீர்", "தண்ணீர்",
            "et0", "evapotranspiration",
        ]
        yield_kw = [
            "yield", "harvest", "production", "மகசூல்",
            "tonnes", "hectare",
        ]
        market_kw = [
            "price", "market", "mandi", "விலை", "சந்தை",
            "cost", "sell",
        ]
        frost_kw = [
            "frost", "cold", "freeze", "பனி", "cold wave",
        ]

        intent = "general_chat"
        confidence = 0.4

        for kw in weather_kw:
            if kw in text:
                intent = "weather_check"
                confidence = 0.7
                break
        for kw in crop_kw:
            if kw in text:
                intent = "crop_recommend"
                confidence = 0.7
                break
        for kw in fertilizer_kw:
            if kw in text:
                intent = "fertilizer_recommend"
                confidence = 0.7
                break
        for kw in water_kw:
            if kw in text:
                intent = "water_management"
                confidence = 0.7
                break
        for kw in yield_kw:
            if kw in text:
                intent = "yield_predict"
                confidence = 0.7
                break
        for kw in market_kw:
            if kw in text:
                intent = "market_price"
                confidence = 0.7
                break
        for kw in frost_kw:
            if kw in text:
                intent = "frost_risk"
                confidence = 0.7
                break

        city = None
        if farm_context and farm_context.get("location"):
            city = farm_context["location"].split(",")[0].strip()

        params = {}
        if intent == "weather_check" and city:
            params["city_name"] = city
        elif intent == "general_chat":
            params["message"] = transcription

        return {
            "intent": intent,
            "confidence": confidence,
            "detected_language": "en",
            "params": params,
            "spoken_response_hint": transcription,
            "fallback": True,
        }

    def format_response_for_speech(
        self,
        intent: str,
        api_response: Dict[str, Any],
        language: str = "en",
    ) -> str:
        """
        Convert a structured API response into a natural-language sentence
        suitable for TTS output.
        """
        data = api_response.get("data", api_response)

        try:
            if intent == "weather_check":
                cw = data.get("current_weather", {})
                rain = data.get("rain_prediction", {})
                city = cw.get("city", "your area")
                temp = cw.get("temp", "unknown")
                desc = cw.get("description", "")
                rain_prob = rain.get("probability", 0)
                rain_pct = round(rain_prob * 100) if rain_prob <= 1 else round(rain_prob)

                if language == "ta":
                    return (
                        f"{city}-ல இப்போ temperature {temp} degree celsius, "
                        f"{desc}. மழை வாய்ப்பு {rain_pct} percent. "
                        f"{rain.get('advice', '')}"
                    )
                return (
                    f"In {city}, the current temperature is {temp}°C with {desc}. "
                    f"Rain probability is {rain_pct}%. {rain.get('advice', '')}"
                )

            elif intent == "crop_recommend":
                crop = data.get("predicted_crop", "unknown crop")
                prob = data.get("probability", 0)
                pct = round(prob * 100) if prob <= 1 else round(prob)
                top5 = data.get("top5_recommendations", [])
                others = ", ".join(c[0] for c in top5[1:4]) if len(top5) > 1 else ""

                if language == "ta":
                    msg = f"உங்கள் மண் நிலைக்கு {crop} பயிர் {pct}% நம்பிக்கையுடன் பரிந்துரைக்கப்படுகிறது."
                    if others:
                        msg += f" மற்ற வாய்ப்புகள்: {others}."
                    return msg
                msg = f"Based on your soil conditions, I recommend growing {crop} with {pct}% confidence."
                if others:
                    msg += f" Other good options are {others}."
                return msg

            elif intent == "fertilizer_recommend":
                fert = data.get("recommended_fertilizer", "unknown")
                advice = data.get("advice", "")
                if language == "ta":
                    return f"பரிந்துரைக்கப்பட்ட உரம்: {fert}. {advice}"
                return f"Recommended fertilizer: {fert}. {advice}"

            elif intent == "water_management":
                crop = data.get("crop", "your crop")
                forecast = data.get("forecast", data.get("daily_results", []))
                if forecast:
                    today = forecast[0]
                    water = today.get("crop_water_need_mm_day", "N/A")
                    if language == "ta":
                        return f"{crop} பயிருக்கு இன்று {water} mm தண்ணீர் தேவை."
                    return f"Your {crop} crop needs approximately {water} mm of water today."
                return f"Water management data for {crop} is being calculated."

            elif intent == "yield_predict":
                crop = data.get("crop", "crop")
                tonnes = data.get("total_production_tonnes", "N/A")
                eval_msg = data.get("yield_evaluation", "")
                if language == "ta":
                    return f"{crop} பயிரின் எதிர்பார்க்கப்படும் மகசூல்: {tonnes} டன்கள். {eval_msg}"
                return f"Expected yield for {crop}: {tonnes} tonnes. {eval_msg}"

            elif intent == "market_price":
                veg = data.get("vegetable", "produce")
                price = data.get("predicted_price_rs_per_quintal", "N/A")
                trend = data.get("price_trend", "")
                advisory = data.get("advisory", "")
                if language == "ta":
                    return f"{veg} சந்தை விலை: ₹{price} per quintal. போக்கு: {trend}. {advisory}"
                return f"{veg} market price forecast: ₹{price} per quintal. Trend: {trend}. {advisory}"

            elif intent == "frost_risk":
                city = data.get("city", "your area")
                risk = data.get("risk_level", "Unknown")
                action = data.get("recommended_action", "")
                if language == "ta":
                    return f"{city}-ல பனிப்பொழிவு நிலை: {risk}. {action}"
                return f"Frost risk for {city}: {risk}. {action}"

            else:
                # general_chat — the reply is already natural language
                return data.get("reply", str(data))

        except Exception as e:
            logger.error(f"Error formatting voice response: {e}")
            return "I processed your request but had trouble formatting the response. Please check the dashboard for details."


# Module-level singleton
voice_intent_service = VoiceIntentService()
