"""
Pydantic Request and Response Schemas for FarmMate API
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Crop Recommendation Schema
class CropRecommendRequest(BaseModel):
    N: float = Field(default=90.0, description="Nitrogen content (ppm)", ge=0, le=300)
    P: float = Field(default=42.0, description="Phosphorus content (ppm)", ge=0, le=300)
    K: float = Field(default=43.0, description="Potassium content (ppm)", ge=0, le=300)
    temperature: float = Field(default=20.8, description="Temperature (°C)")
    humidity: float = Field(default=82.0, description="Relative humidity (%)", ge=0, le=100)
    ph: float = Field(default=6.5, description="Soil pH level", ge=0, le=14)
    rainfall: float = Field(default=202.9, description="Annual rainfall (mm)", ge=0)
    soil_moisture: Optional[float] = Field(default=40.0, description="Soil moisture (%)")
    soil_type: Optional[str] = Field(default="loamy", description="Soil type")
    growth_stage: Optional[str] = Field(default="vegetative", description="Growth stage")
    water_source_type: Optional[str] = Field(default="groundwater", description="Water source")
    sunlight_exposure: Optional[float] = Field(default=8.0, description="Sunlight exposure (hrs/day)")
    wind_speed: Optional[float] = Field(default=5.0, description="Wind speed (km/h)")

# Fertilizer Recommendation Schema
class FertilizerRecommendRequest(BaseModel):
    temperature: float = Field(default=26.0, description="Ambient temperature (°C)")
    humidity: float = Field(default=52.0, description="Humidity (%)")
    moisture: float = Field(default=38.0, description="Soil moisture (%)")
    soil_type: str = Field(default="Loamy Soil", description="Soil type")
    crop_type: str = Field(default="Wheat", description="Crop type")
    nitrogen: float = Field(default=37.0, description="Nitrogen level")
    potassium: float = Field(default=20.0, description="Potassium level")
    phosphorous: float = Field(default=20.0, description="Phosphorous level")
    rainfall: Optional[float] = Field(default=150.0, description="Rainfall (mm)")
    ph: Optional[float] = Field(default=6.5, description="Soil pH")

# Yield Prediction Schema
class YieldPredictRequest(BaseModel):
    crop: str = Field(default="Maize", description="Crop name")
    area_ha: float = Field(default=5.0, description="Cultivation area in hectares", gt=0)
    annual_rainfall: float = Field(default=1200.0, description="Annual rainfall (mm)", ge=0)
    pesticides_tonnes: float = Field(default=10.0, description="Pesticides used in tonnes", ge=0)
    avg_temp: float = Field(default=25.0, description="Average temperature (°C)")
    year: Optional[int] = Field(default=2024, description="Harvest year")

# Market Price Prediction Schema
class MarketPredictRequest(BaseModel):
    vegetable: str = Field(default="Tomato", description="Vegetable commodity name")
    state: str = Field(default="Tamil Nadu", description="State name")
    market: str = Field(default="Chennai", description="Market mandi name")
    month: str = Field(default="October", description="Month")
    temp: float = Field(default=25.0, description="Temperature (°C)")
    disaster: Optional[str] = Field(default="no", description="Recent natural disaster (yes/no)")
    condition: Optional[str] = Field(default="fresh", description="Vegetable condition (fresh/scrap)")
    baseline_demand: Optional[int] = Field(default=100, description="Baseline market demand index")

# Weather Request Schema
class WeatherPredictRequest(BaseModel):
    city_name: str = Field(default="Chennai", description="City name for weather lookup")

# Frost Request Schema
class FrostPredictRequest(BaseModel):
    city: str = Field(default="Shimla", description="City name")
    temperature: float = Field(default=2.0, description="Ambient temperature (°C)")
    humidity: float = Field(default=85.0, description="Humidity (%)")
    wind_speed: float = Field(default=1.5, description="Wind speed (m/s)")
    cloud_cover: float = Field(default=10.0, description="Cloud cover (%)")

# ET0 Request Schema
class ET0CalculateRequest(BaseModel):
    lat: float = Field(default=13.0827, description="Latitude")
    lon: float = Field(default=80.2707, description="Longitude")
    crop_name: str = Field(default="tomatoes", description="Crop name")

# Chat Message Schema
class ChatMessage(BaseModel):
    role: str = Field(description="Role: 'user' or 'assistant'")
    content: str = Field(description="Message text content")

class ChatMessageRequest(BaseModel):
    message: str = Field(description="User prompt text")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation history")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Current FarmMate app context (crop, location, weather)")
