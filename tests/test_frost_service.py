import sys
from pathlib import Path
import pytest

src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.frost_service import frost_service

def test_frost_prediction():
    features = {
        'temperature': 1.5,
        'dew_point': -1.0,
        'humidity': 90.0,
        'wind_speed': 2.0,
        'cloud_cover': 5.0,
        'elevation': 1500
    }
    result = frost_service.predict_frost_risk(features)
    assert "risk_level" in result
    assert "probability" in result
    assert "advisory" in result
    assert isinstance(result["probability"], float)
    assert 0.0 <= result["probability"] <= 1.0
