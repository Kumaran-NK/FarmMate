"""
AgriSmart Evapotranspiration (ET) Calculator Service
Implements the FAO Penman-Monteith equation for reference evapotranspiration (ET0)
and crop water requirement calculation.
"""
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict
from farmmate.utils.weather_api import fetch_5day_forecast

class EvapotranspirationService:
    """Calculates ET0 and crop water requirements."""
    
    CROP_COEFFICIENTS = {
        "grass": 1.00,
        "wheat": 1.05,
        "barley": 1.00,
        "maize": 1.10,
        "tomatoes": 1.15,
        "potatoes": 1.10,
        "lettuce": 1.00,
        "cabbage": 1.05,
        "cotton": 1.15,
        "soybeans": 1.05,
        "vineyard": 0.70,
        "orchard": 0.90,
        "alfalfa": 0.95
    }

    @staticmethod
    def wind_speed_10m_to_2m(u10: float) -> float:
        """Convert wind speed from 10m height to 2m height (FAO standard)."""
        return u10 * (4.87 / math.log((67.8 * 10) - 5.42))

    @staticmethod
    def calculate_solar_declination(day_of_year: int) -> float:
        """Calculate solar declination in radians."""
        return 0.409 * math.sin(2 * math.pi / 365 * day_of_year - 1.39)

    @staticmethod
    def calculate_daylight_hours(lat: float, solar_declination: float) -> float:
        """Calculate maximum daylight hours for latitude."""
        lat_rad = math.radians(lat)
        val = -math.tan(lat_rad) * math.tan(solar_declination)
        val = max(-1.0, min(1.0, val))
        sunset_hour_angle = math.acos(val)
        return 24 / math.pi * sunset_hour_angle

    def calculate_extraterrestrial_radiation(self, lat: float, day_of_year: int) -> float:
        """Calculate extraterrestrial radiation (Ra) in MJ/m²/day."""
        solar_declination = self.calculate_solar_declination(day_of_year)
        lat_rad = math.radians(lat)
        
        G_sc = 0.0820  # Solar constant (MJ/m²/min)
        dr = 1 + 0.033 * math.cos(2 * math.pi / 365 * day_of_year)
        
        val = -math.tan(lat_rad) * math.tan(solar_declination)
        val = max(-1.0, min(1.0, val))
        ws = math.acos(val)
        
        term1 = 24 * 60 / math.pi * G_sc * dr
        term2 = math.sin(lat_rad) * math.sin(solar_declination) * ws
        term3 = math.cos(lat_rad) * math.cos(solar_declination) * math.sin(ws)
        
        return term1 * (term2 + term3)

    def calculate_et0(self, weather_data: Dict[str, Any], lat: float, lon: float = 0.0) -> float:
        """
        Calculate daily reference evapotranspiration (ET0) using FAO Penman-Monteith equation.
        """
        try:
            t_min = weather_data['temp']['min']
            t_max = weather_data['temp']['max']
            t_mean = (t_min + t_max) / 2
            rh_mean = weather_data.get('humidity', 60.0)
            u10 = weather_data.get('wind_speed', 2.0)
            cloudiness = weather_data.get('clouds', 50.0)
            
            dt = weather_data.get('dt', datetime.now().timestamp())
            date = datetime.fromtimestamp(dt)
            day_of_year = date.timetuple().tm_yday
            
            u2 = self.wind_speed_10m_to_2m(u10)
            
            # Saturation vapor pressure
            es = 0.6108 * math.exp(17.27 * t_mean / (t_mean + 237.3))  # kPa
            ea = es * (rh_mean / 100.0)  # kPa
            
            # Slope of vapor pressure curve
            delta = (4098 * es) / ((t_mean + 237.3) ** 2)  # kPa/°C
            gamma = 0.665 * 0.001 * 101.3  # Psychrometric constant ~0.067 kPa/°C
            
            # Extraterrestrial radiation
            ra = self.calculate_extraterrestrial_radiation(lat, day_of_year)
            
            # Solar radiation estimation
            rs = ra * 0.75 * (1 - (cloudiness / 100.0) * 0.5)
            rns = 0.77 * rs
            rnl = 4.903e-9 * (((t_max + 273.16)**4 + (t_min + 273.16)**4) / 2) * (0.34 - 0.14 * math.sqrt(ea)) * (1.35 * (rs / (ra + 1e-5)) - 0.35)
            rn = rns - rnl
            
            # Apply FAO Penman-Monteith equation
            numerator = (0.408 * delta * rn) + (gamma * (900 / (t_mean + 273.16)) * u2 * (es - ea))
            denominator = delta + (gamma * (1 + 0.34 * u2))
            et0 = numerator / denominator
            
            return max(0.1, round(et0, 2))
        except Exception:
            # Simple temperature-based Hargreaves approximation fallback
            t_min = weather_data.get('temp', {}).get('min', 15.0)
            t_max = weather_data.get('temp', {}).get('max', 25.0)
            t_mean = (t_min + t_max) / 2
            return max(0.5, round(t_mean * 0.18, 2))

    def process_forecast(self, lat: float, lon: float, crop_name: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Fetch weather forecast, process daily ET0 and calculate crop water needs."""
        forecast_response = fetch_5day_forecast(lat, lon, api_key)
        
        if "error" in forecast_response:
            return {"error": forecast_response["error"], "daily_results": self._generate_fallback_daily(lat, crop_name)}
            
        daily_map = defaultdict(lambda: {
            'temp_min': float('inf'), 'temp_max': float('-inf'),
            'humidity_sum': 0, 'wind_speed_sum': 0, 'cloud_sum': 0,
            'count': 0, 'dt': None
        })
        
        for item in forecast_response.get('list', []):
            date_str = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            entry = daily_map[date_str]
            
            t_min = item['main'].get('temp_min', item['main']['temp'])
            t_max = item['main'].get('temp_max', item['main']['temp'])
            
            entry['temp_min'] = min(entry['temp_min'], t_min)
            entry['temp_max'] = max(entry['temp_max'], t_max)
            entry['humidity_sum'] += item['main']['humidity']
            entry['wind_speed_sum'] += item['wind']['speed']
            entry['cloud_sum'] += item['clouds']['all']
            entry['count'] += 1
            entry['dt'] = item['dt']
            
        results = []
        kc = self.CROP_COEFFICIENTS.get(crop_name.lower(), 1.0)
        
        for date_str, data in daily_map.items():
            if data['count'] == 0:
                continue
            daily_weather = {
                'dt': data['dt'],
                'temp': {'min': data['temp_min'], 'max': data['temp_max']},
                'humidity': data['humidity_sum'] / data['count'],
                'wind_speed': data['wind_speed_sum'] / data['count'],
                'clouds': data['cloud_sum'] / data['count']
            }
            et0 = self.calculate_et0(daily_weather, lat)
            water_need = round(et0 * kc, 2)
            
            results.append({
                'date': date_str,
                'et0': et0,
                'crop_water_need': water_need,
                'min_temp': round(data['temp_min'], 1),
                'max_temp': round(data['temp_max'], 1),
                'humidity': round(daily_weather['humidity'], 1),
                'wind_speed': round(daily_weather['wind_speed'], 1),
                'cloudiness': round(daily_weather['clouds'], 1)
            })
            
        return {
            "crop": crop_name,
            "kc": kc,
            "daily_results": results,
            "weekly_total_water_need": round(sum(r['crop_water_need'] for r in results), 1)
        }

    def get_et_forecast(self, lat: float, lon: float, crop_name: str = "tomatoes", api_key: Optional[str] = None) -> Dict[str, Any]:
        """Convenience method for UI integration returning formatted forecast and ET0 metrics."""
        res = self.process_forecast(lat=lat, lon=lon, crop_name=crop_name, api_key=api_key)
        daily_res = res.get("daily_results", [])
        formatted = []
        for r in daily_res:
            formatted.append({
                "date": r.get("date"),
                "et0_mm_day": r.get("et0"),
                "crop_water_need_mm_day": r.get("crop_water_need"),
                "min_temp": r.get("min_temp"),
                "max_temp": r.get("max_temp"),
                "humidity": r.get("humidity"),
                "wind_speed": r.get("wind_speed"),
                "cloudiness": r.get("cloudiness")
            })
        return {
            "crop": res.get("crop", crop_name),
            "crop_coefficient": res.get("kc", 1.0),
            "forecast": formatted,
            "daily_results": daily_res
        }

    def _generate_fallback_daily(self, lat: float, crop_name: str) -> List[Dict[str, Any]]:
        """Generate demo fallback dataset if OpenWeather API is unreachable."""
        kc = self.CROP_COEFFICIENTS.get(crop_name.lower(), 1.0)
        now = datetime.now()
        results = []
        for i in range(5):
            date_str = (now + timedelta(days=i)).strftime('%Y-%m-%d')
            et0 = round(3.5 + i * 0.3, 2)
            results.append({
                'date': date_str,
                'et0': et0,
                'crop_water_need': round(et0 * kc, 2),
                'min_temp': 18.0 + i,
                'max_temp': 28.0 + i,
                'humidity': 65.0,
                'wind_speed': 3.0,
                'cloudiness': 20.0
            })
        return results

et_service = EvapotranspirationService()
