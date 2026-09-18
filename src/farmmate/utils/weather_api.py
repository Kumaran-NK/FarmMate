"""
Weather API Utility module for FarmMate
Handles requests to OpenWeatherMap API with validation and fallback support.
"""
import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from farmmate.config import settings

def get_api_key(custom_key: Optional[str] = None) -> str:
    """Retrieve API key from argument or configuration settings."""
    if custom_key and custom_key.strip():
        return custom_key.strip()
    return settings.OPENWEATHER_API_KEY

def fetch_current_weather(city_or_query: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch current weather details for a given city query.
    Returns structured weather dictionary or error dict.
    """
    key = get_api_key(api_key)
    clean_city = city_or_query.split(",")[0].strip()
    url = f"https://api.openweathermap.org/data/2.5/weather?q={clean_city}&appid={key}&units=metric"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 401:
            return {"error": "Invalid OpenWeatherMap API key. Please check your configuration."}
        elif response.status_code == 404:
            return {"error": f"City '{clean_city}' not found."}
        response.raise_for_status()
        
        data = response.json()
        return {
            "city": data.get("name", clean_city),
            "country": data.get("sys", {}).get("country", ""),
            "lat": data.get("coord", {}).get("lat", 0.0),
            "lon": data.get("coord", {}).get("lon", 0.0),
            "temp": data.get("main", {}).get("temp", 25.0),
            "feels_like": data.get("main", {}).get("feels_like", 25.0),
            "temp_min": data.get("main", {}).get("temp_min", 20.0),
            "temp_max": data.get("main", {}).get("temp_max", 30.0),
            "humidity": data.get("main", {}).get("humidity", 60),
            "pressure": data.get("main", {}).get("pressure", 1013),
            "wind_speed": data.get("wind", {}).get("speed", 3.0),
            "wind_dir": data.get("wind", {}).get("deg", 0),
            "clouds": data.get("clouds", {}).get("all", 20),
            "description": data.get("weather", [{}])[0].get("description", "clear sky"),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except requests.exceptions.RequestException as e:
        return {"error": f"Network or API error: {str(e)}"}

def fetch_weather_by_coords(lat: float, lon: float, api_key: Optional[str] = None) -> Dict[str, Any]:
    """Fetch current weather data using geographical coordinates."""
    key = get_api_key(api_key)
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return {
            "city": data.get("name", f"Location ({lat:.2f}, {lon:.2f})"),
            "country": data.get("sys", {}).get("country", ""),
            "lat": lat,
            "lon": lon,
            "temp": data.get("main", {}).get("temp", 25.0),
            "feels_like": data.get("main", {}).get("feels_like", 25.0),
            "temp_min": data.get("main", {}).get("temp_min", 20.0),
            "temp_max": data.get("main", {}).get("temp_max", 30.0),
            "humidity": data.get("main", {}).get("humidity", 60),
            "pressure": data.get("main", {}).get("pressure", 1013),
            "wind_speed": data.get("wind", {}).get("speed", 3.0),
            "clouds": data.get("clouds", {}).get("all", 20),
            "description": data.get("weather", [{}])[0].get("description", "clear sky")
        }
    except Exception as e:
        return {"error": f"Failed to fetch weather for coordinates ({lat}, {lon}): {str(e)}"}

def fetch_5day_forecast(lat: float, lon: float, api_key: Optional[str] = None) -> Dict[str, Any]:
    """Fetch 5-day / 3-hour forecast data for latitude and longitude."""
    key = get_api_key(api_key)
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={key}&units=metric"
    
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": f"Failed to fetch forecast: {str(e)}"}
