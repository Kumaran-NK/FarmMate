import sys
from pathlib import Path
import pytest

src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.yield_service import yield_service

def test_yield_prediction():
    result = yield_service.predict_yield(
        crop="Maize",
        area_ha=10.0,
        annual_rainfall=1250.0,
        pesticides_tonnes=15.0,
        avg_temp=25.0
    )
    assert "predicted_yield_hg_ha" in result
    assert "total_production_tonnes" in result
    assert "yield_tonnes_per_ha" in result
    assert result["predicted_yield_hg_ha"] > 0
    assert result["total_production_tonnes"] > 0
