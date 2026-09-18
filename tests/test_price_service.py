import sys
from pathlib import Path
import pytest

src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.price_service import price_service

def test_price_prediction():
    result = price_service.predict_price(
        item="Tomato",
        state="Tamil Nadu",
        market="Chennai",
        month="October",
        rainfall_mm=120.0
    )
    assert "predicted_price_rs_per_quintal" in result
    assert "demand_status" in result
    assert "advisory" in result
    assert result["predicted_price_rs_per_quintal"] > 0
