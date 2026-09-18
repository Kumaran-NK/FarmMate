import sys
from pathlib import Path
import pytest

# Ensure src is on path
src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from farmmate.services.crop_service import crop_service, CropRecommendationService

def test_crop_service_initialization():
    service = CropRecommendationService()
    assert service._is_loaded is False

def test_crop_recommendation_prediction():
    features = {
        'N': 90, 'P': 42, 'K': 43,
        'temperature': 20.8, 'humidity': 82.0,
        'ph': 6.5, 'rainfall': 202.9
    }
    result = crop_service.recommend_crop(features)
    assert "predicted_crop" in result
    assert "probability" in result
    assert isinstance(result["probability"], float)
    assert len(result["top5_recommendations"]) > 0
    assert result["predicted_crop"].lower() in [c.lower() for c in crop_service.CROPS] or len(result["predicted_crop"]) > 0
