"""
Vegetable Price & Market Demand Prediction Service
Loads trained Stacking Regressor model (XGBoost, LightGBM, CatBoost + Ridge meta-learner)
and calculates market price, price elasticity demand, logistics advice, and crop recommendations.
"""
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from farmmate.config import settings

class VegetablePriceService:
    """Service for predicting vegetable market prices and economic demand simulation."""

    MONTH_MAP = {
        'jan': 1, 'january': 1,
        'feb': 2, 'february': 2,
        'mar': 3, 'march': 3,
        'apr': 4, 'april': 4,
        'may': 5,
        'jun': 6, 'june': 6,
        'jul': 7, 'july': 7,
        'aug': 8, 'august': 8,
        'sep': 9, 'sept': 9, 'september': 9,
        'oct': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'december': 12
    }

    VEGETABLES = ["Tomato", "Potato", "Onion", "Carrot", "Cabbage", "Spinach", "Cauliflower", "Brinjal"]
    ITEMS = VEGETABLES
    STATES = ["Tamil Nadu", "Maharashtra", "Karnataka", "Punjab", "Uttar Pradesh", "West Bengal", "Gujarat"]
    MARKETS = ["Chennai", "Mumbai", "Bengaluru", "Amritsar", "Lucknow", "Kolkata", "Ahmedabad"]
    SEASONS = ["Winter", "Summer", "Monsoon", "Spring"]
    CONDITIONS = ["Fresh", "Scrap"]

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.numeric_cols = None
        self._is_loaded = False

    def load_artifacts(self) -> bool:
        """Load trained StackingRegressor model dictionary."""
        if self._is_loaded:
            return True
            
        model_path = settings.MODELS_DIR / "vegetable_price_stack.pkl"
        try:
            if model_path.exists():
                artifacts = joblib.load(model_path)
                if isinstance(artifacts, dict):
                    self.model = artifacts.get('model')
                    self.scaler = artifacts.get('scaler')
                    self.feature_columns = artifacts.get('feature_columns')
                    self.numeric_cols = artifacts.get('numeric_cols', [])
                else:
                    self.model = artifacts
                self._is_loaded = True
                return True
        except Exception as e:
            print(f"Warning: Could not load vegetable price model: {e}")
        return False

    def simulate_demand(self, price: float, baseline_demand: float = 100.0, elasticity: float = 0.5) -> float:
        """Simulate market demand using price elasticity curve."""
        p = float(max(1.0, price))
        demand = baseline_demand * (p / (baseline_demand * 0.4)) ** (-elasticity)
        return round(max(10.0, demand), 1)

    def logistics_advice(self, season: str, condition: str) -> str:
        """Generate supply chain and transport advice based on season and product condition."""
        cond = str(condition).strip().lower()
        seas = str(season).strip().lower()
        
        if cond in ['scrap', 'damaged', 'scarp']:
            return "⚠️ Low transport value item. Recommend immediate local sale or processing into paste/powder/biomass."
        elif seas in ['summer', 'monsoon', 'rainy']:
            return "❄️ High perishability risk! Utilize refrigerated cold-chain transport and expedited routing to minimize post-harvest loss."
        else:
            return "🚛 Standard ventilated transit recommended. Prioritize high-demand urban wholesale mandis."

    def crop_planning_recommendation(self, predicted_demand: float, baseline_demand: float = 100.0) -> str:
        """Provide strategic farming recommendations based on predicted market demand."""
        if predicted_demand >= baseline_demand * 1.2:
            return "📈 High Market Demand — Excellent opportunity to expand harvest or increase planting density for next cycle."
        elif predicted_demand <= baseline_demand * 0.7:
            return "📉 Low Market Demand — High supply saturation expected. Consider staggering harvest or storing in cold storage."
        else:
            return "⚖️ Moderate Demand — Stable market price dynamics. Maintain planned harvest schedule."

    def predict_price(self, vegetable: str = "Tomato", season: str = "Winter", month: str = "October", 
                      temp: float = 25.0, disaster: str = "no", condition: str = "fresh", 
                      baseline_demand: int = 100, **kwargs) -> Dict[str, Any]:
        """Predict market price per kg and supply chain analytics."""
        self.load_artifacts()
        
        # Support alternative argument names
        if 'item' in kwargs:
            vegetable = kwargs['item']
        if 'state' in kwargs or 'market' in kwargs or 'rainfall_mm' in kwargs:
            if 'temp' not in kwargs:
                temp = 25.0
        
        # Prepare input dataframe
        user_df = pd.DataFrame({
            'Vegetable': [vegetable],
            'Season': [season],
            'Month': [str(month).lower()],
            'Temp': [temp],
            'Deasaster Happen in last 3month': [1 if str(disaster).lower() in ['yes', 'y', '1'] else 0],
            'Vegetable condition': [str(condition).lower()]
        })

        month_val = self.MONTH_MAP.get(str(month).lower(), 1)
        user_df['Month'] = month_val

        pred_price = 35.0
        if self.model is not None and self.feature_columns:
            try:
                cat_cols = [c for c in ['Vegetable', 'Season', 'Vegetable condition'] if c in user_df.columns]
                user_enc = pd.get_dummies(user_df, columns=cat_cols, drop_first=False)
                
                for col in self.feature_columns:
                    if col not in user_enc.columns:
                        user_enc[col] = 0
                
                user_enc = user_enc[self.feature_columns]
                
                if self.scaler and self.numeric_cols:
                    user_enc[self.numeric_cols] = self.scaler.transform(user_enc[self.numeric_cols])

                pred_price = float(self.model.predict(user_enc)[0])
            except Exception as e:
                print(f"Price model prediction error: {e}")
                pred_price = self._heuristic_price(vegetable, season, disaster, condition)
        else:
            pred_price = self._heuristic_price(vegetable, season, disaster, condition)

        pred_price = round(max(5.0, pred_price), 2)
        price_per_quintal = round(pred_price * 100.0, 2)
        demand = self.simulate_demand(pred_price, baseline_demand=baseline_demand)
        logistics = self.logistics_advice(season, condition)
        recommendation = self.crop_planning_recommendation(demand, baseline_demand=baseline_demand)

        return {
            "vegetable": vegetable,
            "season": season,
            "month": str(month).title(),
            "predicted_price_per_kg": pred_price,
            "predicted_price_rs_per_quintal": price_per_quintal,
            "estimated_demand_units": demand,
            "demand_status": "High Demand 🔥" if demand > 110 else "Stable Demand ⚖️",
            "price_trend": "Bullish 📈" if pred_price > 35 else "Bearish 📉",
            "advisory": f"{recommendation} {logistics}",
            "logistics_advice": logistics,
            "crop_recommendation": recommendation,
            "inputs": {
                "Temperature": temp,
                "Recent_Disaster": disaster,
                "Condition": condition
            },
            "source": "Trained Stacking Ensemble Model (XGBoost + LightGBM + CatBoost)" if self.model else "Market Baseline"
        }

    def _heuristic_price(self, veg: str, season: str, disaster: str, condition: str) -> float:
        """Market price baseline fallback calculation."""
        base_prices = {"Tomato": 35.0, "Potato": 25.0, "Onion": 40.0, "Carrot": 30.0, "Cabbage": 20.0, "Spinach": 15.0}
        base = base_prices.get(veg, 30.0)
        if disaster.lower() in ['yes', 'y', '1']:
            base *= 1.45
        if condition.lower() == 'scrap':
            base *= 0.35
        if season.lower() in ['summer', 'monsoon']:
            base *= 1.15
        return base

price_service = VegetablePriceService()
