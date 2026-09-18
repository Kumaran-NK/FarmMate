"""
FarmMate Utilities Package
Exposes weather API, Redis cache manager, ONNX inference engine, and conversion helpers.
"""
from farmmate.utils.weather_api import (
    fetch_current_weather,
    fetch_weather_by_coords,
    fetch_5day_forecast
)
from farmmate.utils.cache import cache_manager, RedisCacheManager
from farmmate.utils.onnx_engine import ONNXInferenceEngine
from farmmate.utils.convert_to_onnx import convert_all_models

__all__ = [
    "fetch_current_weather",
    "fetch_weather_by_coords",
    "fetch_5day_forecast",
    "cache_manager",
    "RedisCacheManager",
    "ONNXInferenceEngine",
    "convert_all_models"
]
