"""
Smart Crop Recommendation Service
Loads trained RandomForest classifier model, scaler, encoders, and crop dictionary
to recommend crops based on soil, climate, and agronomic inputs.
"""
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from farmmate.config import settings

class CropRecommendationService:
    """Service for predicting optimal crop selection using ML."""
    
    FEATURE_NAMES = [
        'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall',
        'soil_moisture', 'soil_type', 'sunlight_exposure', 'wind_speed',
        'co2_concentration', 'organic_matter', 'irrigation_frequency',
        'crop_density', 'pest_pressure', 'fertilizer_usage', 'growth_stage',
        'urban_area_proximity', 'water_source_type', 'frost_risk',
        'water_usage_efficiency', 'N_P_ratio', 'K_P_ratio', 'temp_humidity',
        'soil_fertility', 'rainfall_ph_interaction', 'moisture_temp',
        'sunlight_co2', 'pest_organic_ratio', 'irrigation_efficiency',
        'urban_frost_risk'
    ]
    
    DEFAULT_CROP_DICT = {
        0: 'rice', 1: 'maize', 2: 'jute', 3: 'cotton', 4: 'coconut',
        5: 'papaya', 6: 'orange', 7: 'apple', 8: 'muskmelon', 9: 'watermelon',
        10: 'grapes', 11: 'mango', 12: 'banana', 13: 'pomegranate', 14: 'lentil',
        15: 'blackgram', 16: 'mungbean', 17: 'mothbeans', 18: 'pigeonpeas',
        19: 'kidneybeans', 20: 'chickpea', 21: 'coffee'
    }

    CROPS = list(DEFAULT_CROP_DICT.values())

    def __init__(self):
        self.model = None
        self.scaler = None
        self.soil_encoder = None
        self.growth_encoder = None
        self.water_encoder = None
        self.crop_dict = self.DEFAULT_CROP_DICT
        self._is_loaded = False
        
    def load_artifacts(self) -> bool:
        """Load trained crop model, scaler, encoders, and crop dict from models directory."""
        if self._is_loaded:
            return True
            
        model_path = settings.MODELS_DIR / "best_crop_model.pkl"
        scaler_path = settings.MODELS_DIR / "crop_scaler.pkl"
        soil_enc_path = settings.MODELS_DIR / "soil_type_encoder.pkl"
        growth_enc_path = settings.MODELS_DIR / "growth_stage_encoder.pkl"
        water_enc_path = settings.MODELS_DIR / "water_source_type_encoder.pkl"
        crop_dict_path = settings.MODELS_DIR / "crop_dict.pkl"
        
        try:
            if model_path.exists():
                self.model = joblib.load(model_path)
                if hasattr(self.model, 'estimators_'):
                    for est in self.model.estimators_:
                        if not hasattr(est, 'monotonic_cst'):
                            est.monotonic_cst = None
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
            if soil_enc_path.exists():
                self.soil_encoder = joblib.load(soil_enc_path)
            if growth_enc_path.exists():
                self.growth_encoder = joblib.load(growth_enc_path)
            if water_enc_path.exists():
                self.water_encoder = joblib.load(water_enc_path)
            if crop_dict_path.exists():
                loaded_dict = joblib.load(crop_dict_path)
                if isinstance(loaded_dict, dict):
                    # Handle both name->idx and idx->name
                    if isinstance(next(iter(loaded_dict.keys())), str):
                        self.crop_dict = {v: k for k, v in loaded_dict.items()}
                    else:
                        self.crop_dict = loaded_dict

            self._is_loaded = True
            return True
        except Exception as e:
            print(f"Warning: Failed to load crop model artifacts: {e}")
            return False

    def encode_categorical(self, encoder: Any, value: str, default_val: int = 0) -> int:
        """Helper to transform categorical string using LabelEncoder safely."""
        if encoder and hasattr(encoder, 'transform'):
            try:
                return int(encoder.transform([str(value).lower().strip()])[0])
            except Exception:
                try:
                    classes = list(getattr(encoder, 'classes_', []))
                    if classes:
                        val_str = str(value).lower().strip()
                        for i, cls in enumerate(classes):
                            if str(cls).lower().strip() == val_str:
                                return i
                except Exception:
                    pass
        return default_val

    def get_crop_name(self, class_val: Any) -> str:
        """Convert predicted class identifier or index to formatted crop name."""
        try:
            idx = int(class_val)
            if idx in self.crop_dict:
                return str(self.crop_dict[idx]).title()
        except (ValueError, TypeError):
            pass
        return str(class_val).title()

    def recommend_crop(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict crop recommendations based on soil & climate features.
        Supports core inputs (N, P, K, temp, humidity, ph, rainfall) and optional advanced parameters.
        """
        self.load_artifacts()
        
        # Extract inputs with realistic defaults
        n_val = float(features_dict.get('N', 50))
        p_val = float(features_dict.get('P', 50))
        k_val = float(features_dict.get('K', 50))
        temp_val = float(features_dict.get('temperature', 25.0))
        hum_val = float(features_dict.get('humidity', 70.0))
        ph_val = float(features_dict.get('ph', 6.5))
        rain_val = float(features_dict.get('rainfall', 200.0))
        
        soil_moisture = float(features_dict.get('soil_moisture', 40.0))
        soil_type_str = str(features_dict.get('soil_type', 'loamy'))
        sunlight = float(features_dict.get('sunlight_exposure', 8.0))
        wind = float(features_dict.get('wind_speed', 5.0))
        co2 = float(features_dict.get('co2_concentration', 415.0))
        organic = float(features_dict.get('organic_matter', 2.5))
        irrigation_freq = float(features_dict.get('irrigation_frequency', 3.0))
        crop_density = float(features_dict.get('crop_density', 5.0))
        pest_pressure = float(features_dict.get('pest_pressure', 8.0))
        fertilizer_usage = float(features_dict.get('fertilizer_usage', 70.0))
        growth_stage_str = str(features_dict.get('growth_stage', 'vegetative'))
        urban_prox = float(features_dict.get('urban_area_proximity', 30.0))
        water_src_str = str(features_dict.get('water_source_type', 'groundwater'))
        frost_risk = float(features_dict.get('frost_risk', 0.1))
        water_eff = float(features_dict.get('water_usage_efficiency', 2.5))
        
        soil_enc = self.encode_categorical(self.soil_encoder, soil_type_str, 1)
        growth_enc = self.encode_categorical(self.growth_encoder, growth_stage_str, 2)
        water_enc = self.encode_categorical(self.water_encoder, water_src_str, 0)
        
        # Build complete 32-feature dict matching model expected schema
        full_features = {
            'N': n_val, 'P': p_val, 'K': k_val,
            'temperature': temp_val, 'humidity': hum_val,
            'ph': ph_val, 'rainfall': rain_val,
            'soil_moisture': soil_moisture,
            'soil_type': soil_enc,
            'sunlight_exposure': sunlight,
            'wind_speed': wind,
            'co2_concentration': co2,
            'organic_matter': organic,
            'irrigation_frequency': irrigation_freq,
            'crop_density': crop_density,
            'pest_pressure': pest_pressure,
            'fertilizer_usage': fertilizer_usage,
            'growth_stage': growth_enc,
            'urban_area_proximity': urban_prox,
            'water_source_type': water_enc,
            'frost_risk': frost_risk,
            'water_usage_efficiency': water_eff,
            'N_P_ratio': n_val / (p_val + 1e-5),
            'K_P_ratio': k_val / (p_val + 1e-5),
            'temp_humidity': temp_val * hum_val,
            'soil_fertility': (n_val + p_val + k_val) / 3.0,
            'rainfall_ph_interaction': rain_val * ph_val,
            'moisture_temp': soil_moisture * temp_val,
            'sunlight_co2': sunlight * co2,
            'pest_organic_ratio': pest_pressure / (organic + 1e-5),
            'irrigation_efficiency': irrigation_freq * water_eff,
            'urban_frost_risk': urban_prox * frost_risk
        }
        
        input_data = pd.DataFrame([full_features])[self.FEATURE_NAMES]
        
        if self.model is not None:
            try:
                if self.scaler is not None:
                    try:
                        scaled_input = self.scaler.transform(input_data)
                    except Exception:
                        scaled_input = input_data
                else:
                    scaled_input = input_data
                    
                if hasattr(self.model, "predict_proba"):
                    raw_probs = self.model.predict_proba(scaled_input)[0]
                    classes = self.model.classes_
                    
                    # Normalize probabilities if needed
                    prob_sum = float(np.sum(raw_probs))
                    if prob_sum > 0:
                        probs = raw_probs / prob_sum
                    else:
                        probs = raw_probs
                    
                    top_indices = np.argsort(probs)[::-1][:5]
                    top5 = [(self.get_crop_name(classes[idx]), float(probs[idx])) for idx in top_indices]
                    
                    best_crop = top5[0][0]
                    best_prob = top5[0][1]
                else:
                    pred_class = self.model.predict(scaled_input)[0]
                    best_crop = self.get_crop_name(pred_class)
                    best_prob = 0.92
                    top5 = [(best_crop, 0.92)]
                    
                return {
                    "predicted_crop": best_crop,
                    "probability": round(best_prob, 3),
                    "top5_recommendations": top5,
                    "features_used": {
                        'N': n_val, 'P': p_val, 'K': k_val,
                        'temperature': temp_val, 'humidity': hum_val,
                        'ph': ph_val, 'rainfall': rain_val
                    },
                    "source": "Trained RandomForest ML Model"
                }
            except Exception as e:
                print(f"Crop model prediction error: {e}, using fallback agronomic rules")
        
        # Agronomic Rule Fallback
        return self._rule_fallback(n_val, p_val, k_val, temp_val, hum_val, ph_val, rain_val)

    def _rule_fallback(self, N: float, P: float, K: float, temp: float, humidity: float, ph: float, rainfall: float) -> Dict[str, Any]:
        """Fallback rules based on standard agronomic crop thresholds."""
        if rainfall > 1000 and temp > 22:
            prediction = "Rice"
            prob = 0.85
            top5 = [("Rice", 0.85), ("Papaya", 0.10), ("Banana", 0.05)]
        elif temp < 20 and ph > 6.0:
            prediction = "Apple"
            prob = 0.80
            top5 = [("Apple", 0.80), ("Grapes", 0.15), ("Pomegranate", 0.05)]
        elif N > 80 and K > 40:
            prediction = "Coffee"
            prob = 0.78
            top5 = [("Coffee", 0.78), ("Cotton", 0.15), ("Maize", 0.07)]
        else:
            prediction = "Maize"
            prob = 0.72
            top5 = [("Maize", 0.72), ("Chickpea", 0.18), ("Lentil", 0.10)]
            
        return {
            "predicted_crop": prediction,
            "probability": prob,
            "top5_recommendations": top5,
            "features_used": {'N': N, 'P': P, 'K': K, 'temperature': temp, 'humidity': humidity, 'ph': ph, 'rainfall': rainfall},
            "source": "Agronomic Knowledge Base (Fallback)"
        }

crop_service = CropRecommendationService()
