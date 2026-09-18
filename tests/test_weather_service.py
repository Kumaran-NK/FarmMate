import sys
from pathlib import Path
import pytest

src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.weather_service import weather_service

def test_weather_prediction():
    result = weather_service.predict_weather("Bengaluru")
    assert "current_weather" in result
    assert "rain_prediction" in result
    assert "hourly_forecast" in result
    assert "temp" in result["current_weather"]
    assert "probability" in result["rain_prediction"]
    assert len(result["hourly_forecast"]["temperatures"]) == 5
