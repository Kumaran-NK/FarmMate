"""
FarmMate Alert Service — Smart Agricultural Notifications

Evaluates weather, frost, and market conditions to generate proactive
alerts for farmers. Supports browser push notification payloads.
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("farmmate.alerts")


# Alert severity levels
SEVERITY_INFO = "info"
SEVERITY_WARNING = "warning"
SEVERITY_CRITICAL = "critical"


class AlertRule:
    """Defines a condition that triggers an alert."""

    def __init__(self, rule_id: str, name: str, category: str, evaluate_fn=None):
        self.rule_id = rule_id
        self.name = name
        self.category = category
        self.evaluate_fn = evaluate_fn


class AlertService:
    """Evaluates farm conditions and generates alert notifications."""

    def __init__(self):
        self._subscriptions: Dict[str, Dict[str, Any]] = {}
        self._alert_history: List[Dict[str, Any]] = []

    def evaluate_weather_alerts(self, weather_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check weather data for alert conditions."""
        alerts = []
        current = weather_data.get("current_weather", {})
        rain = weather_data.get("rain_prediction", {})

        temp = current.get("temp")
        humidity = current.get("humidity")
        wind_speed = current.get("wind_speed", 0)
        rain_prob = rain.get("probability", 0)
        city = current.get("city", "Your area")

        # Heavy rain alert
        if rain_prob > 0.75:
            alerts.append({
                "id": f"rain_heavy_{datetime.now().strftime('%Y%m%d')}",
                "type": "rain_alert",
                "severity": SEVERITY_CRITICAL,
                "title": "🌧️ Heavy Rain Expected",
                "message": f"Rain probability in {city} is {int(rain_prob * 100)}%. "
                          f"Postpone spraying and protect harvested crops. Ensure drainage channels are clear.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"rain_probability": rain_prob, "city": city},
            })
        elif rain_prob > 0.50:
            alerts.append({
                "id": f"rain_moderate_{datetime.now().strftime('%Y%m%d')}",
                "type": "rain_alert",
                "severity": SEVERITY_WARNING,
                "title": "🌦️ Rain Likely Today",
                "message": f"There's a {int(rain_prob * 100)}% chance of rain in {city}. "
                          f"Consider adjusting your irrigation schedule.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"rain_probability": rain_prob, "city": city},
            })

        # Heat stress alert
        if temp and temp > 40:
            alerts.append({
                "id": f"heat_{datetime.now().strftime('%Y%m%d')}",
                "type": "heat_alert",
                "severity": SEVERITY_CRITICAL,
                "title": "🔥 Extreme Heat Warning",
                "message": f"Temperature in {city} is {temp}°C. Apply mulch to conserve soil moisture. "
                          f"Irrigate during early morning or late evening only.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"temperature": temp, "city": city},
            })
        elif temp and temp > 35:
            alerts.append({
                "id": f"heat_mod_{datetime.now().strftime('%Y%m%d')}",
                "type": "heat_alert",
                "severity": SEVERITY_WARNING,
                "title": "☀️ High Temperature Advisory",
                "message": f"Temperature in {city} is {temp}°C. Ensure adequate irrigation and consider shade nets for sensitive crops.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"temperature": temp, "city": city},
            })

        # Frost alert
        if temp is not None and temp <= 4:
            severity = SEVERITY_CRITICAL if temp <= 0 else SEVERITY_WARNING
            alerts.append({
                "id": f"frost_{datetime.now().strftime('%Y%m%d')}",
                "type": "frost_alert",
                "severity": severity,
                "title": "❄️ Frost Risk Alert",
                "message": f"Temperature in {city} is {temp}°C. Protect sensitive crops with covers or smudge pots. "
                          f"Avoid irrigating tonight — wet soil increases frost damage.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"temperature": temp, "city": city},
            })

        # High wind alert
        if wind_speed > 40:
            alerts.append({
                "id": f"wind_{datetime.now().strftime('%Y%m%d')}",
                "type": "wind_alert",
                "severity": SEVERITY_WARNING,
                "title": "💨 Strong Wind Advisory",
                "message": f"Wind speed in {city} is {wind_speed} km/h. Stake tall crops and secure shade structures.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"wind_speed": wind_speed, "city": city},
            })

        # Low humidity (dry conditions)
        if humidity and humidity < 25:
            alerts.append({
                "id": f"dry_{datetime.now().strftime('%Y%m%d')}",
                "type": "dry_alert",
                "severity": SEVERITY_INFO,
                "title": "🏜️ Very Dry Conditions",
                "message": f"Humidity in {city} is only {humidity}%. Increase irrigation frequency and apply mulch.",
                "category": "weather",
                "timestamp": datetime.now().isoformat(),
                "data": {"humidity": humidity, "city": city},
            })

        return alerts

    def evaluate_frost_alerts(self, frost_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check frost prediction data for alerts."""
        alerts = []
        prob = frost_data.get("frost_probability", frost_data.get("probability", 0))
        city = frost_data.get("city", "Your area")
        risk_level = frost_data.get("risk_level", "")

        if prob > 0.7:
            alerts.append({
                "id": f"frost_high_{datetime.now().strftime('%Y%m%d')}",
                "type": "frost_alert",
                "severity": SEVERITY_CRITICAL,
                "title": "🚨 High Frost Risk Tonight",
                "message": f"Frost probability for {city}: {int(prob * 100)}%. {risk_level}. "
                          f"Take immediate protective action — crop covers, smudge pots, or overhead irrigation.",
                "category": "frost",
                "timestamp": datetime.now().isoformat(),
                "data": frost_data,
            })
        elif prob > 0.4:
            alerts.append({
                "id": f"frost_mod_{datetime.now().strftime('%Y%m%d')}",
                "type": "frost_alert",
                "severity": SEVERITY_WARNING,
                "title": "⚠️ Moderate Frost Risk",
                "message": f"Frost probability for {city}: {int(prob * 100)}%. Monitor dawn temperatures closely.",
                "category": "frost",
                "timestamp": datetime.now().isoformat(),
                "data": frost_data,
            })

        return alerts

    def evaluate_all(
        self,
        weather_data: Optional[Dict[str, Any]] = None,
        frost_data: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Evaluate all alert rules and return triggered alerts."""
        all_alerts = []

        if weather_data:
            all_alerts.extend(self.evaluate_weather_alerts(weather_data))
        if frost_data:
            all_alerts.extend(self.evaluate_frost_alerts(frost_data))

        # Store in history
        for alert in all_alerts:
            self._alert_history.append(alert)

        # Keep only last 50 alerts
        self._alert_history = self._alert_history[-50:]

        return all_alerts

    def get_alert_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent alert history."""
        return self._alert_history[-limit:]

    def subscribe(self, subscription_id: str, preferences: Dict[str, Any]):
        """Register a push notification subscription."""
        self._subscriptions[subscription_id] = {
            "preferences": preferences,
            "subscribed_at": datetime.now().isoformat(),
        }
        logger.info(f"Alert subscription registered: {subscription_id}")

    def unsubscribe(self, subscription_id: str):
        """Remove a push notification subscription."""
        self._subscriptions.pop(subscription_id, None)
        logger.info(f"Alert subscription removed: {subscription_id}")

    def get_subscriptions(self) -> Dict[str, Dict[str, Any]]:
        """Get all active subscriptions."""
        return self._subscriptions


# Module-level singleton
alert_service = AlertService()
