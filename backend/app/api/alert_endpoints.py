"""
FarmMate Alert API Endpoints

Provides alert evaluation, subscription management, and notification history.
"""
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

src_path = Path(__file__).resolve().parent.parent.parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.alert_service import alert_service
from farmmate.services.weather_service import weather_service
from farmmate.services.frost_service import frost_service

alert_router = APIRouter()


class AlertCheckRequest(BaseModel):
    city_name: str = Field(default="Chennai", description="City for alert evaluation")
    check_frost: bool = Field(default=False, description="Also check frost risk")


class AlertPreferences(BaseModel):
    subscription_id: str = Field(description="Unique browser push subscription ID")
    rain_alerts: bool = Field(default=True)
    frost_alerts: bool = Field(default=True)
    heat_alerts: bool = Field(default=True)
    market_alerts: bool = Field(default=False)


@alert_router.post("/alerts/check")
async def check_alerts(req: AlertCheckRequest) -> Dict[str, Any]:
    """Evaluate current conditions and return any active alerts."""
    try:
        weather_data = weather_service.predict_weather(city_name=req.city_name)
        frost_data = None
        if req.check_frost:
            cw = weather_data.get("current_weather", {})
            frost_input = {
                "city": req.city_name,
                "temperature": cw.get("temp", 25),
                "humidity": cw.get("humidity", 50),
                "wind_speed": cw.get("wind_speed", 5),
                "cloud_cover": cw.get("clouds", 20),
            }
            frost_data = frost_service.predict_frost_risk(frost_input)

        alerts = alert_service.evaluate_all(
            weather_data=weather_data,
            frost_data=frost_data,
        )

        return {
            "status": "success",
            "alerts": alerts,
            "total": len(alerts),
            "city": req.city_name,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert check failed: {str(e)}")


@alert_router.get("/alerts/history")
async def get_alert_history() -> Dict[str, Any]:
    """Get recent alert history."""
    return {
        "status": "success",
        "alerts": alert_service.get_alert_history(limit=20),
    }


@alert_router.post("/alerts/subscribe")
async def subscribe_alerts(prefs: AlertPreferences) -> Dict[str, Any]:
    """Register push notification subscription."""
    alert_service.subscribe(prefs.subscription_id, prefs.model_dump())
    return {"status": "success", "message": "Subscribed to alerts"}


@alert_router.post("/alerts/unsubscribe")
async def unsubscribe_alerts(data: Dict[str, str]) -> Dict[str, Any]:
    """Remove push notification subscription."""
    sub_id = data.get("subscription_id", "")
    alert_service.unsubscribe(sub_id)
    return {"status": "success", "message": "Unsubscribed from alerts"}


@alert_router.get("/rag/stats")
async def get_rag_stats() -> Dict[str, Any]:
    """Get RAG knowledge base statistics."""
    try:
        from farmmate.services.rag_service import rag_service
        return {"status": "success", "data": rag_service.get_stats()}
    except Exception as e:
        return {"status": "unavailable", "error": str(e)}


@alert_router.post("/rag/reingest")
async def reingest_rag() -> Dict[str, Any]:
    """Force re-ingestion of knowledge documents into ChromaDB."""
    try:
        from farmmate.services.rag_service import rag_service
        success = rag_service.reingest()
        return {"status": "success" if success else "failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
