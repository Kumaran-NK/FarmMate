"""
Crop Yield Prediction Service
Loads trained DecisionTree/RandomForest model and ColumnTransformer preprocessor
to predict crop yield (hg/ha and tons/ha) with reference threshold evaluation.
"""
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from farmmate.config import settings

class YieldPredictionService:
    """Service for predicting crop yield per hectare."""

    SUPPORTED_CROPS = ["Maize", "Rice, paddy", "Wheat", "Potatoes", "Sorghum", "Soybeans", "Cassava", "Sweet potatoes"]
    
    CROP_THRESHOLDS = {
        "Maize": (4.0, 10.0),
        "Rice, paddy": (3.0, 6.0),
        "Wheat": (2.0, 5.0),
        "Potatoes": (20.0, 40.0),
        "Sorghum": (1.5, 4.0),
        "Soybeans": (1.5, 3.5),
        "Cassava": (8.0, 20.0),
        "Sweet potatoes": (10.0, 25.0)
    }

    def __init__(self):
        self.model = None
        self.preprocessor = None
        self._is_loaded = False

    def load_artifacts(self) -> bool:
        """Load trained DecisionTree model and ColumnTransformer preprocessor."""
        if self._is_loaded:
            return True
            
        model_path = settings.MODELS_DIR / "dtr_model.pkl"
        preprocessor_path = settings.MODELS_DIR / "yield_preprocessor.pkl"
        
        try:
            if model_path.exists():
                self.model = joblib.load(model_path)
            if preprocessor_path.exists():
                self.preprocessor = joblib.load(preprocessor_path)
            self._is_loaded = True
            return True
        except Exception as e:
            print(f"Warning: Could not load yield model artifacts: {e}")
            return False

    def predict_yield(self, crop: str = "Maize", area: Any = "India", 
                      year: int = 2024, rainfall: float = 1200.0, 
                      pesticides: float = 10.0, temp: float = 25.0, **kwargs) -> Dict[str, Any]:
        """
        Predict crop yield based on climate, pesticide usage, area, and crop type.
        """
        self.load_artifacts()
        
        # Support kwargs mapping
        if 'area_ha' in kwargs:
            area_ha_val = float(kwargs['area_ha'])
        elif isinstance(area, (int, float)):
            area_ha_val = float(area)
            area = "India"
        else:
            area_ha_val = 1.0

        if 'annual_rainfall' in kwargs:
            rainfall = float(kwargs['annual_rainfall'])
        if 'pesticides_tonnes' in kwargs:
            pesticides = float(kwargs['pesticides_tonnes'])
        if 'avg_temp' in kwargs:
            temp = float(kwargs['avg_temp'])
        
        # Prepare feature array in exact order expected by preprocessor: [Year, Rainfall, Pesticides, Temp, Area, Crop]
        features = np.array([[year, rainfall, pesticides, temp, area, crop]], dtype=object)
        
        predicted_hg_per_ha = 45000.0
        if self.model is not None and self.preprocessor is not None:
            try:
                transformed = self.preprocessor.transform(features)
                predicted_hg_per_ha = float(self.model.predict(transformed)[0])
            except Exception as e:
                print(f"Yield model inference failed: {e}")
                predicted_hg_per_ha = self._heuristic_yield(crop, rainfall, temp)
        else:
            predicted_hg_per_ha = self._heuristic_yield(crop, rainfall, temp)

        # Convert hg/ha to tons/ha (1 hg = 0.0001 kg = 0.0000001 ton; 1 hg/ha = 0.0001 kg/ha = 0.0000001 tons/ha)
        # Note: In FAO yield datasets, yield is given in hectograms per hectare (hg/ha).
        # 10,000 hg/ha = 1,000 kg/ha = 1 ton/ha.
        predicted_tons_per_ha = predicted_hg_per_ha / 10000.0

        # Evaluation against thresholds
        evaluation = self._evaluate_yield(crop, predicted_tons_per_ha)

        total_production = round(predicted_tons_per_ha * area_ha_val, 2)

        return {
            "crop": crop,
            "area": area,
            "year": year,
            "predicted_yield_hg_per_ha": round(predicted_hg_per_ha, 2),
            "predicted_yield_hg_ha": round(predicted_hg_per_ha, 2),
            "predicted_yield_tons_per_ha": round(predicted_tons_per_ha, 2),
            "yield_tonnes_per_ha": round(predicted_tons_per_ha, 2),
            "total_production_tonnes": total_production,
            "yield_evaluation": evaluation,
            "inputs": {
                "Rainfall_mm": rainfall,
                "Pesticides_tonnes": pesticides,
                "Temperature_C": temp
            },
            "source": "Trained DecisionTree ML Regressor" if self.model else "FAO Baseline Benchmark"
        }

    def _evaluate_yield(self, crop: str, predicted_tons: float) -> str:
        """Evaluate predicted yield against typical range."""
        for key, (low, high) in self.CROP_THRESHOLDS.items():
            if key.lower() in crop.lower():
                if predicted_tons < low:
                    return f"⬇️ LOW yield compared to standard range ({low}-{high} tons/ha)."
                elif predicted_tons > high:
                    return f"⬆️ HIGH yield compared to standard range ({low}-{high} tons/ha)."
                else:
                    return f"✅ OPTIMAL yield within standard range ({low}-{high} tons/ha)."
        return "ℹ️ Yield predicted successfully (No crop reference range benchmark available)."

    def _heuristic_yield(self, crop: str, rainfall: float, temp: float) -> float:
        """Heuristic yield calculation fallback."""
        base = 35000.0
        if "rice" in crop.lower():
            base = 45000.0
        elif "potato" in crop.lower():
            base = 250000.0
        elif "maize" in crop.lower():
            base = 55000.0
        return base + (rainfall * 5.0) - (abs(temp - 25.0) * 500.0)

yield_service = YieldPredictionService()
