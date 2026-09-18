"""
Indian Cities Frost Prediction Service
Uses trained XGBoost classification model to compute frost risk probability for 20 major Indian cities.
"""
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional
from farmmate.config import settings
from farmmate.utils.weather_api import fetch_current_weather, fetch_5day_forecast

class FrostPredictionService:
    """Service for predicting frost risk probability in Indian cities."""
    
    CITIES_DATA = {
        "Leh": {"lat": 34.15, "lon": 77.58, "elevation": 3500, "region": "Himalayan"},
        "Shimla": {"lat": 31.10, "lon": 77.17, "elevation": 2200, "region": "Himalayan"},
        "Srinagar": {"lat": 34.09, "lon": 74.80, "elevation": 1600, "region": "Himalayan"},
        "Manali": {"lat": 32.24, "lon": 77.19, "elevation": 2050, "region": "Himalayan"},
        "Dehradun": {"lat": 30.32, "lon": 78.03, "elevation": 650, "region": "Himalayan"},
        "Shillong": {"lat": 25.58, "lon": 91.89, "elevation": 1500, "region": "Northeast"},
        "Gangtok": {"lat": 27.34, "lon": 88.61, "elevation": 1600, "region": "Himalayan"},
        "Dalhousie": {"lat": 32.53, "lon": 75.95, "elevation": 2000, "region": "Himalayan"},
        "Nainital": {"lat": 29.39, "lon": 79.45, "elevation": 2100, "region": "Himalayan"},
        "Mussoorie": {"lat": 30.46, "lon": 78.08, "elevation": 2000, "region": "Himalayan"},
        "Darjeeling": {"lat": 27.04, "lon": 88.27, "elevation": 2100, "region": "Himalayan"},
        "Ooty": {"lat": 11.41, "lon": 76.70, "elevation": 2200, "region": "Southern"},
        "Kodaikanal": {"lat": 10.23, "lon": 77.49, "elevation": 2100, "region": "Southern"},
        "Munnar": {"lat": 10.09, "lon": 77.06, "elevation": 1600, "region": "Southern"},
        "Coonoor": {"lat": 11.35, "lon": 76.82, "elevation": 1800, "region": "Southern"},
        "Amritsar": {"lat": 31.63, "lon": 74.87, "elevation": 230, "region": "Northern"},
        "Chandigarh": {"lat": 30.73, "lon": 76.78, "elevation": 350, "region": "Northern"},
        "Jaipur": {"lat": 26.91, "lon": 75.79, "elevation": 430, "region": "Northern"},
        "Delhi": {"lat": 28.61, "lon": 77.21, "elevation": 220, "region": "Northern"},
        "Lucknow": {"lat": 26.85, "lon": 80.95, "elevation": 120, "region": "Northern"}
    }

    REGION_ENCODING = {'Himalayan': 0, 'Northeast': 1, 'Southern': 2, 'Northern': 3}

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_cols = None
        self.threshold = 0.5
        self._is_loaded = False

    def load_artifacts(self) -> bool:
        """Load trained XGBoost frost model dictionary."""
        if self._is_loaded:
            return True
        model_path = settings.MODELS_DIR / "frost_prediction_model.pkl"
        try:
            if model_path.exists():
                data = joblib.load(model_path)
                if isinstance(data, dict):
                    self.model = data.get('model')
                    self.scaler = data.get('scaler')
                    self.feature_cols = data.get('feature_cols')
                    self.threshold = float(data.get('optimal_threshold', 0.5))
                else:
                    self.model = data
                self._is_loaded = True
                return True
        except Exception as e:
            print(f"Warning: Could not load frost prediction model: {e}")
        return False

    def build_feature_dict(self, weather: Dict[str, Any], city_name: str) -> Dict[str, Any]:
        """Construct full engineered feature vector for frost XGBoost model."""
        city_info = self.CITIES_DATA.get(city_name, {"elevation": 500, "region": "Northern"})
        now = datetime.now()
        
        temp = float(weather.get('temp', 10.0))
        feels_like = float(weather.get('feels_like', temp))
        humidity = float(weather.get('humidity', 70.0))
        pressure = float(weather.get('pressure', 1013.0))
        wind_speed = float(weather.get('wind_speed', 2.0))
        clouds = float(weather.get('clouds', 20.0))
        
        # Calculate dew point approximation
        dew_point = temp - ((100 - humidity) / 5.0)
        
        features = {
            'temp': temp,
            'feels_like': feels_like,
            'pressure': pressure,
            'humidity': humidity,
            'dew_point': dew_point,
            'clouds': clouds,
            'wind_speed': wind_speed,
            'wind_deg': weather.get('wind_dir', 0),
            'weather_id': 800,
            'elevation': city_info['elevation'],
            'hour': now.hour,
            'day_of_year': now.timetuple().tm_yday,
            'month': now.month,
            'day_of_week': now.weekday(),
            'is_weekend': 1 if now.weekday() >= 5 else 0,
            'hour_sin': np.sin(2 * np.pi * now.hour / 24.0),
            'hour_cos': np.cos(2 * np.pi * now.hour / 24.0),
            'day_sin': np.sin(2 * np.pi * now.timetuple().tm_yday / 365.25),
            'day_cos': np.cos(2 * np.pi * now.timetuple().tm_yday / 365.25),
            'month_sin': np.sin(2 * np.pi * (now.month - 1) / 12.0),
            'month_cos': np.cos(2 * np.pi * (now.month - 1) / 12.0),
            'season': (now.month % 12 + 3) // 3,
            'is_winter': 1 if now.month in [12, 1, 2] else 0,
            'heat_index': 0.5 * (temp + 61.0 + ((temp - 68.0) * 1.2) + (humidity * 0.094)),
            'wind_chill': 13.12 + 0.6215 * temp - 11.37 * (max(0.1, wind_speed) ** 0.16) + 0.3965 * temp * (max(0.1, wind_speed) ** 0.16),
            'frost_risk_index': (dew_point - temp) + (100 - humidity) / 10.0 + wind_speed,
            'dew_point_depression': temp - dew_point,
            'city_encoded': list(self.CITIES_DATA.keys()).index(city_name) if city_name in self.CITIES_DATA else 0,
            'region_encoded': self.REGION_ENCODING.get(city_info['region'], 0)
        }
        
        # Add default lag/rolling features
        for lag in [1, 2, 3, 6]:
            features[f'temp_lag_{lag}'] = temp
            features[f'humidity_lag_{lag}'] = humidity
            features[f'wind_speed_lag_{lag}'] = wind_speed

        for col in ['temp', 'humidity', 'pressure', 'wind_speed']:
            features[f'{col}_6h_avg'] = features[col]
            features[f'{col}_6h_std'] = 0.0

        features['temp_change_3h'] = 0.0
        features['temp_change_6h'] = 0.0
        
        return features

    def predict_frost_risk(self, city_or_features: Any, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Predict frost risk for a selected city name or feature dictionary."""
        self.load_artifacts()
        
        if isinstance(city_or_features, dict):
            city_name = city_or_features.get('city', 'Shimla')
            weather = {
                "city": city_name,
                "temp": city_or_features.get('temperature', 2.0),
                "feels_like": city_or_features.get('temperature', 2.0) - 1.0,
                "humidity": city_or_features.get('humidity', 85.0),
                "pressure": 1015,
                "wind_speed": city_or_features.get('wind_speed', 2.0),
                "clouds": city_or_features.get('cloud_cover', 10.0)
            }
        else:
            city_name = str(city_or_features)
            weather = fetch_current_weather(city_name, api_key)
            if "error" in weather:
                city_info = self.CITIES_DATA.get(city_name, {"elevation": 1500, "region": "Himalayan"})
                temp_default = 2.0 if city_info["elevation"] > 2000 else 12.0
                weather = {
                    "city": city_name, "temp": temp_default, "feels_like": temp_default - 1,
                    "humidity": 85.0, "pressure": 1015, "wind_speed": 1.5, "clouds": 10
                }

        city_info = self.CITIES_DATA.get(city_name, {"elevation": 500, "region": "Northern"})
        input_feats = self.build_feature_dict(weather, city_name)
        
        probability = 0.1
        if self.model is not None and self.feature_cols:
            try:
                input_df = pd.DataFrame([input_feats])
                for col in self.feature_cols:
                    if col not in input_df.columns:
                        input_df[col] = 0.0
                        
                X_input = input_df[self.feature_cols]
                if self.scaler:
                    X_scaled = self.scaler.transform(X_input)
                else:
                    X_scaled = X_input
                    
                if hasattr(self.model, "predict_proba"):
                    probability = float(self.model.predict_proba(X_scaled)[0, 1])
                else:
                    probability = float(self.model.predict(X_scaled)[0])
            except Exception as e:
                print(f"Frost ML model prediction failed: {e}")
                probability = self._heuristic_frost_prob(weather['temp'], weather['humidity'])
        else:
            probability = self._heuristic_frost_prob(weather['temp'], weather['humidity'])

        # Risk Classification
        if probability >= 0.7:
            risk_level = "🚨 HIGH RISK - Frost Very Likely"
            action = "Take immediate protective measures: activate heaters/sprinklers and cover sensitive crops."
            alert_class = "risk-high"
        elif probability >= 0.4:
            risk_level = "⚠️ MODERATE RISK - Frost Possible"
            action = "Monitor ambient temperatures closely through the night and prepare crop covers."
            alert_class = "risk-moderate"
        elif probability >= 0.2:
            risk_level = "🔶 LOW RISK - Frost Unlikely"
            action = "Stay alert for dropping temperatures near dawn."
            alert_class = "risk-low"
        else:
            risk_level = "✅ VERY LOW RISK - No Frost Expected"
            action = "No special frost mitigation required."
            alert_class = "risk-very-low"

        return {
            'city': city_name,
            'region': city_info['region'],
            'elevation': city_info['elevation'],
            'temperature': weather['temp'],
            'feels_like': weather.get('feels_like', weather['temp']),
            'humidity': weather['humidity'],
            'wind_speed': weather['wind_speed'],
            'dew_point': round(input_feats['dew_point'], 1),
            'frost_probability': round(probability, 3),
            'probability': round(probability, 3),
            'risk_level': risk_level,
            'recommended_action': action,
            'advisory': action,
            'alert_class': alert_class,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    def _heuristic_frost_prob(self, temp: float, humidity: float) -> float:
        """Physical meteorological heuristic fallback."""
        if temp <= 0:
            return 0.95
        elif temp <= 2.0:
            return 0.75
        elif temp <= 4.0 and humidity > 80:
            return 0.50
        elif temp <= 6.0:
            return 0.25
        return 0.05

frost_service = FrostPredictionService()
