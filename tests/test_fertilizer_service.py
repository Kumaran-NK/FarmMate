import sys
from pathlib import Path
import pytest

src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.fertilizer_service import fertilizer_service

def test_fertilizer_recommendation():
    result = fertilizer_service.recommend_fertilizer(
        temperature=26.0,
        humidity=52.0,
        moisture=38.0,
        soil_type="Sandy",
        crop_type="Maize",
        nitrogen=37,
        potassium=0,
        phosphorous=0
    )
    assert "recommended_fertilizer" in result
    assert "advice" in result
    assert isinstance(result["recommended_fertilizer"], str)
    assert len(result["recommended_fertilizer"]) > 0
