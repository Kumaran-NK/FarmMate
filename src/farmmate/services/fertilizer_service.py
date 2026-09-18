"""
Fertilizer Recommendation Service
Loads trained ML models and provides agronomic safety override logic
for fertilizer selection based on soil nutrients, pH, and crop parameters.
"""
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional
from farmmate.config import settings

class FertilizerRecommendationService:
    """Service for predicting optimal fertilizer application."""
    
    SOIL_TYPES = ['Acidic Soil', 'Neutral Soil', 'Alkaline Soil', 'Sandy Soil', 
                  'Loamy Soil', 'Clay Soil', 'Peaty Soil']
    CROP_TYPES = ['wheat', 'rice', 'maize', 'barley', 'millet', 'sugarcane',
                  'cotton', 'tea', 'coffee', 'apple', 'banana', 'mango']

    FEATURE_NAMES = [
        'Temperature', 'Moisture', 'Rainfall', 'PH', 'Nitrogen', 'Phosphorous',
        'Potassium', 'Carbon', 'Soil_encoded', 'Crop_encoded', 'N_P_Ratio',
        'N_K_Ratio', 'P_K_Ratio', 'Nutrient_Balance_Index',
        'Moisture_Rainfall_Interaction', 'N_Level_encoded', 'P_Level_encoded',
        'K_Level_encoded', 'pH_Category_encoded', 'N_deficit', 'P_deficit',
        'K_deficit', 'Acidic_Soil_Crop', 'Alkaline_Soil_Crop', 'Moisture_Stress',
        'Temperature_Stress', 'NP_Ratio_Class_encoded', 'NK_Ratio_Class_encoded'
    ]

    def __init__(self):
        self.model_data = None
        self._is_loaded = False

    def load_artifacts(self) -> bool:
        """Load trained fertilizer model data dictionary."""
        if self._is_loaded:
            return True
            
        model_path = settings.MODELS_DIR / "simple_fertilizer_model.pkl"
        if not model_path.exists():
            model_path = settings.MODELS_DIR / "best_fertilizer_model.pkl"

        try:
            if model_path.exists():
                self.model_data = joblib.load(model_path)
                self._is_loaded = True
                return True
        except Exception as e:
            print(f"Warning: Could not load fertilizer model: {e}")
        return False

    def rule_based_recommendation(self, input_data: Dict[str, Any]) -> Tuple[str, str, float]:
        """Pure agronomic rule-based system for fertilizer recommendation."""
        ph = float(input_data.get('PH', 6.5))
        n = float(input_data.get('Nitrogen', 40))
        p = float(input_data.get('Phosphorous', 30))
        k = float(input_data.get('Potassium', 35))
        moisture = float(input_data.get('Moisture', 38.0))
        if moisture < 1.0: # Normalize 0-1 range to percentage
            moisture = moisture * 100.0
        rainfall = float(input_data.get('Rainfall', 150))
        crop = str(input_data.get('Crop', 'wheat')).lower()

        # pH Extreme overrides
        if ph < 5.5:
            return "Lime (Agricultural Calcium Carbonate)", "Highly acidic soil requires pH neutralization before fertilizer uptake", 0.95
        elif ph > 7.8:
            return "Gypsum (Calcium Sulfate)", "Alkaline soil requires pH adjustment to unlock micro-nutrients", 0.95

        # Nutrient deficiency rules
        if n < 20 and p < 15 and k < 15:
            return "Organic Compost / FYM", "Severe multi-nutrient deficiency requires soil structure build-up", 0.90
        elif n < 25:
            return "Urea (46-0-0)", "Primary Nitrogen deficiency identified", 0.85
        elif p < 20:
            return "DAP (Diammonium Phosphate 18-46-0)", "Primary Phosphorus deficiency identified", 0.85
        elif k < 20:
            return "Muriate of Potash (MOP 0-0-60)", "Primary Potassium deficiency identified", 0.85

        # Environmental factors
        if moisture < 20.0 or rainfall < 50:
            return "Bio-fertilizer with Water Retaining Hydrogel", "Dry soil conditions require moisture retention support", 0.80

        # Crop specific
        if crop in ['tea', 'coffee']:
            return "Organic NPK Complex (8-8-8)", "Perennial crop requires slow-release organic blend", 0.80

        return "Balanced NPK (19-19-19)", "General balanced plant nutrition recommendation", 0.75

    def recommend_fertilizer(self, input_data: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """
        Produce fertilizer recommendation using ML model if available,
        with automated override for extreme pH or severe nutrient deficiencies.
        """
        self.load_artifacts()
        
        data = {}
        if isinstance(input_data, dict):
            data.update(input_data)
        elif isinstance(input_data, (int, float)):
            data['temperature'] = input_data
        data.update(kwargs)
        
        temp = float(data.get('temperature', data.get('Temp', 26.0)))
        humidity = float(data.get('humidity', data.get('Humidity', 52.0)))
        moisture = float(data.get('moisture', data.get('Moisture', 38.0)))
        if moisture < 1.0:
            moisture = moisture * 100.0
            
        ph = float(data.get('ph', data.get('PH', 6.5)))
        n = float(data.get('nitrogen', data.get('Nitrogen', data.get('N', 37.0))))
        p = float(data.get('phosphorous', data.get('Phosphorous', data.get('P', 20.0))))
        k = float(data.get('potassium', data.get('Potassium', data.get('K', 20.0))))
        rainfall = float(data.get('rainfall', data.get('Rainfall', 150.0)))
        soil_type = str(data.get('soil_type', data.get('Soil', 'Loamy')))
        crop_type = str(data.get('crop_type', data.get('Crop', 'Wheat')))

        params = {
            'PH': ph, 'Nitrogen': n, 'Phosphorous': p, 'Potassium': k,
            'Moisture': moisture, 'Temperature': temp, 'Humidity': humidity,
            'Rainfall': rainfall, 'Soil': soil_type, 'Crop': crop_type
        }
        
        # Rule recommendation check
        rule_fertilizer, rule_reason, rule_conf = self.rule_based_recommendation(params)
        
        # Extreme condition override
        if ph < 5.5 or ph > 7.8 or (n < 20 and p < 15 and k < 15) or moisture < 20.0:
            return {
                "recommended_fertilizer": rule_fertilizer,
                "confidence": rule_conf,
                "explanation": f"Agronomic Safety Override: {rule_reason}",
                "advice": f"Agronomic Safety Override: {rule_reason}",
                "source": "Agronomic Rule Engine",
                "input_parameters": params
            }
            
        # ML Model prediction
        if self.model_data and isinstance(self.model_data, dict):
            try:
                model = self.model_data.get('model')
                features = self.model_data.get('features', self.FEATURE_NAMES)
                le_fertilizer = self.model_data.get('le_fertilizer')
                le_soil = self.model_data.get('le_soil')
                le_crop = self.model_data.get('le_crop')

                if model:
                    soil_enc = 0
                    if le_soil and hasattr(le_soil, 'transform'):
                        try:
                            soil_enc = int(le_soil.transform([soil_type])[0])
                        except Exception:
                            soil_enc = 0

                    crop_enc = 0
                    if le_crop and hasattr(le_crop, 'transform'):
                        try:
                            crop_enc = int(le_crop.transform([crop_type.lower()])[0])
                        except Exception:
                            crop_enc = 0

                    n_p_ratio = n / (p + 1e-5)
                    n_k_ratio = n / (k + 1e-5)
                    p_k_ratio = p / (k + 1e-5)

                    feature_dict = {
                        'Temperature': temp,
                        'Moisture': moisture,
                        'Rainfall': rainfall,
                        'PH': ph,
                        'Nitrogen': n,
                        'Phosphorous': p,
                        'Potassium': k,
                        'Carbon': 0.5,
                        'Soil_encoded': soil_enc,
                        'Crop_encoded': crop_enc,
                        'N_P_Ratio': n_p_ratio,
                        'N_K_Ratio': n_k_ratio,
                        'P_K_Ratio': p_k_ratio,
                        'Nutrient_Balance_Index': (n + p + k) / 3.0,
                        'Moisture_Rainfall_Interaction': moisture * rainfall,
                        'N_Level_encoded': 0 if n < 30 else (1 if n < 70 else 2),
                        'P_Level_encoded': 0 if p < 30 else (1 if p < 70 else 2),
                        'K_Level_encoded': 0 if k < 30 else (1 if k < 70 else 2),
                        'pH_Category_encoded': 0 if ph < 6.0 else (1 if ph <= 7.5 else 2),
                        'N_deficit': max(0.0, 50.0 - n),
                        'P_deficit': max(0.0, 50.0 - p),
                        'K_deficit': max(0.0, 50.0 - k),
                        'Acidic_Soil_Crop': 1 if ph < 6.0 else 0,
                        'Alkaline_Soil_Crop': 1 if ph > 7.5 else 0,
                        'Moisture_Stress': 1 if moisture < 25.0 else 0,
                        'Temperature_Stress': 1 if temp > 35.0 or temp < 15.0 else 0,
                        'NP_Ratio_Class_encoded': 1 if n_p_ratio > 1.5 else 0,
                        'NK_Ratio_Class_encoded': 1 if n_k_ratio > 1.5 else 0
                    }

                    input_df = pd.DataFrame([feature_dict])
                    for col in features:
                        if col not in input_df.columns:
                            input_df[col] = 0.0

                    X_input = input_df[features]

                    fertilizer_code = model.predict(X_input)[0]
                    if le_fertilizer and hasattr(le_fertilizer, 'inverse_transform'):
                        fertilizer_name = str(le_fertilizer.inverse_transform([fertilizer_code])[0])
                    else:
                        fertilizer_name = str(fertilizer_code)

                    explanation_text = f"Recommended by trained Machine Learning classifier. Soil NPK ratios: N={n}, P={p}, K={k}."
                    return {
                        "recommended_fertilizer": fertilizer_name,
                        "confidence": 0.94,
                        "explanation": explanation_text,
                        "advice": explanation_text,
                        "source": "Trained ML Classifier",
                        "input_parameters": params
                    }
            except Exception as e:
                print(f"ML fertilizer prediction failed: {e}")

        rule_text = f"Rule-based recommendation: {rule_reason}"
        return {
            "recommended_fertilizer": rule_fertilizer,
            "confidence": rule_conf,
            "explanation": rule_text,
            "advice": rule_text,
            "source": "Agronomic Knowledge Engine",
            "input_parameters": params
        }

fertilizer_service = FertilizerRecommendationService()
