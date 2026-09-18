import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CropRecommendation, WeatherResponse } from '../types';
import type { WeatherCondition } from '../components/FarmScene';

export interface LocationState {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export type Language = 'en' | 'ta';

interface FarmContextType {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  latestCropPrediction: CropRecommendation | null;
  setLatestCropPrediction: (crop: CropRecommendation | null) => void;
  latestWeather: WeatherResponse | null;
  setLatestWeather: (weather: WeatherResponse | null) => void;
  weatherCondition: WeatherCondition;
  t: (key: string) => string;
}

const DEFAULT_LOCATION: LocationState = {
  city: 'Chennai',
  state: 'Tamil Nadu',
  lat: 13.0827,
  lon: 80.2707
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    cropAdvisor: 'Crop Advisor',
    fertilizerAdvisor: 'Fertilizer Advisor',
    weather: 'Weather',
    waterManagement: 'Water Management',
    yieldPrediction: 'Yield Prediction',
    marketPrices: 'Market Prices',
    aiAssistant: 'AI Assistant',
    recommendedCrop: 'Recommended Crop',
    confidence: 'Model Confidence',
    irrigationNeed: 'Water Requirement',
    frostRisk: 'Frost Risk',
    rainProbability: 'Rain Probability',
    marketPrice: 'Market Price',
    analyzeSoil: 'Analyze Soil & Climate',
    getWeather: 'Get Weather Forecast',
    calculateWater: 'Calculate Irrigation Need',
    predictHarvest: 'Predict Harvest Yield',
    forecastPrice: 'Forecast Market Price',
    askAi: 'Ask FarmMate AI'
  },
  ta: {
    dashboard: 'டாஷ்போர்டு (முகப்பு)',
    cropAdvisor: 'பயிர் ஆலோசனை',
    fertilizerAdvisor: 'உர வழிகாட்டி',
    weather: 'வானிலை',
    waterManagement: 'நீர்ப்பாசன மேலாண்மை',
    yieldPrediction: 'மகசூல் கணிப்பு',
    marketPrices: 'சந்தை விலைகள்',
    aiAssistant: 'AI உதவி',
    recommendedCrop: 'பரிந்துரைக்கப்பட்ட பயிர்',
    confidence: 'மாடல் நம்பிக்கை நிலை',
    irrigationNeed: 'தேவையான நீர் அளவு',
    frostRisk: 'பனிப்பொழிவு அபாயம்',
    rainProbability: 'மழை வாய்ப்பு',
    marketPrice: 'சந்தை விலை',
    analyzeSoil: 'மண் மற்றும் காலநிலையை ஆய்வு செய்',
    getWeather: 'வானிலை முன்னறிவிப்பு பெறு',
    calculateWater: 'நீர்ப்பாசன தேவையை கணக்கிடு',
    predictHarvest: 'மகசூலை கணித்திடு',
    forecastPrice: 'சந்தை விலையை கணித்திடு',
    askAi: 'FarmMate AI-யிடம் கேள்'
  }
};

export const parseWeatherCondition = (desc?: string, temp?: number): WeatherCondition => {
  if (temp !== undefined && temp <= 2) return 'frost';
  if (!desc) return 'sunny';
  const lower = desc.toLowerCase();
  if (lower.includes('thunder') || lower.includes('storm')) return 'storm';
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return 'rain';
  if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return 'fog';
  if (lower.includes('cloud') || lower.includes('overcast')) return 'cloudy';
  if (lower.includes('clear') || lower.includes('sun')) return 'sunny';
  return 'sunny';
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const [language, setLanguage] = useState<Language>('en');
  const [latestCropPrediction, setLatestCropPrediction] = useState<CropRecommendation | null>(null);
  const [latestWeather, setLatestWeather] = useState<WeatherResponse | null>(null);

  const weatherCondition: WeatherCondition = parseWeatherCondition(
    latestWeather?.current_weather.description,
    latestWeather?.current_weather.temp
  );

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <FarmContext.Provider
      value={{
        location,
        setLocation,
        language,
        setLanguage,
        latestCropPrediction,
        setLatestCropPrediction,
        latestWeather,
        setLatestWeather,
        weatherCondition,
        t
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmContext = () => {
  const ctx = useContext(FarmContext);
  if (!ctx) {
    throw new Error('useFarmContext must be used within a FarmProvider');
  }
  return ctx;
};
