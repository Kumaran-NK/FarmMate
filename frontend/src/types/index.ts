export interface CropRecommendation {
  predicted_crop: string;
  probability: number;
  top5_recommendations: [string, number][];
  features_used: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
  source: string;
}

export interface FertilizerRecommendation {
  recommended_fertilizer: string;
  confidence: number;
  explanation: string;
  advice: string;
  source: string;
  input_parameters: Record<string, any>;
}

export interface YieldPrediction {
  crop: string;
  area: string;
  year: number;
  predicted_yield_hg_per_ha: number;
  predicted_yield_tons_per_ha: number;
  yield_tonnes_per_ha: number;
  total_production_tonnes: number;
  yield_evaluation: string;
  inputs: {
    Rainfall_mm: number;
    Pesticides_tonnes: number;
    Temperature_C: number;
  };
  source: string;
}

export interface MarketPrediction {
  vegetable: string;
  season: string;
  month: string;
  predicted_price_per_kg: number;
  predicted_price_rs_per_quintal: number;
  estimated_demand_units: number;
  demand_status: string;
  price_trend: string;
  advisory: string;
  logistics_advice: string;
  crop_recommendation: string;
  inputs: Record<string, any>;
  source: string;
}

export interface WeatherTelemetry {
  city: string;
  country?: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_dir?: number;
  clouds: number;
  description: string;
  timestamp: string;
}

export interface RainPrediction {
  probability: number;
  rain_likely: boolean;
  advice: string;
}

export interface HourlyForecast {
  times: string[];
  temperatures: number[];
  humidities: number[];
}

export interface WeatherResponse {
  current_weather: WeatherTelemetry;
  rain_prediction: RainPrediction;
  hourly_forecast: HourlyForecast;
}

export interface FrostRiskResponse {
  city: string;
  region: string;
  elevation: number;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  dew_point: number;
  frost_probability: number;
  probability: number;
  risk_level: string;
  recommended_action: string;
  advisory: string;
  alert_class: string;
  timestamp: string;
}

export interface DailyET0Result {
  date: string;
  et0_mm_day: number;
  crop_water_need_mm_day: number;
  min_temp: number;
  max_temp: number;
  humidity: number;
  wind_speed: number;
  cloudiness: number;
}

export interface ET0Response {
  crop: string;
  crop_coefficient: number;
  forecast: DailyET0Result[];
  daily_results: DailyET0Result[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CropCatalogItem {
  name: string;
  description: string;
  temperature_range: string;
  rainfall_range: string;
  soil_type: string;
  water_need: string;
  image: string;
}
