import sys
from pathlib import Path
import pytest

src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.et_service import et_service

def test_calculate_et0():
    weather_sample = {
        'temp_min': 18.0,
        'temp_max': 32.0,
        'humidity': 65.0,
        'wind_speed': 3.5,
        'clouds': 20.0
    }
    et0 = et_service.calculate_et0(weather_sample, lat=13.08, lon=80.27)
    assert isinstance(et0, float)
    assert et0 > 0.0

def test_get_et_forecast():
    result = et_service.get_et_forecast(lat=13.08, lon=80.27, crop_name="tomatoes")
    assert "forecast" in result
    assert "crop_coefficient" in result
    assert len(result["forecast"]) >= 5
    first_day = result["forecast"][0]
    assert "et0_mm_day" in first_day
    assert "crop_water_need_mm_day" in first_day
