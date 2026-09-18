import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sprout,
  FlaskConical,
  Sun,
  Droplets,
  Tractor,
  TrendingUp,
  Bot,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CloudRain,
  Thermometer,
  Wind
} from 'lucide-react';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import type { WeatherResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import { AlertBanner } from '../components/AlertBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { WeatherBackground } from '../components/WeatherBackground';

export const Dashboard: React.FC = () => {
  const { location, t, setLatestWeather } = useFarmContext();
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingWeather(true);
    api.predictWeather(location.city).then((data) => {
      if (isMounted) {
        setWeatherData(data);
        setLatestWeather(data);
        setLoadingWeather(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [location.city]);

  const currWeather = weatherData?.current_weather;
  const rainInfo = weatherData?.rain_prediction;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner with Dynamic 2D Weather Scene */}
      <WeatherBackground heightClass="min-h-[280px]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FarmMate Agronomic Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            Smart Decision Support for Modern Agriculture
          </h1>

          <p className="text-slate-200 text-sm mt-3 leading-relaxed drop-shadow">
            Real-time weather telemetry, machine learning crop advisories, FAO-56 irrigation planning, market forecasting, and AI assistance for <b>{location.city}, {location.state}</b>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <NavLink
              to="/crop-advisor"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 hover:scale-105 transition-all"
            >
              <Sprout className="w-4 h-4" />
              <span>{t('cropAdvisor')}</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>

            <NavLink
              to="/ai-assistant"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition-all backdrop-blur-md"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{t('askAi')}</span>
            </NavLink>
          </div>
        </div>
      </WeatherBackground>

      {/* Active Farm Alerts & Health Advisories */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Farm Health & Advisory Alerts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rainInfo?.rain_likely ? (
            <AlertBanner
              type="rain"
              title="🌧️ Rain Expected in 24 Hours"
              message="High rain probability detected by XGBoost AI weather model. Consider delaying scheduled irrigation."
            />
          ) : (
            <AlertBanner
              type="success"
              title="🌤️ Clear Skies & Optimal Field Conditions"
              message="No significant rainfall expected today. Proceed with standard irrigation and crop maintenance."
            />
          )}

          <AlertBanner
            type="irrigation"
            title="💧 Reference Evapotranspiration (ET0) Advisory"
            message="Estimated daily crop water need is 5.2 mm. Maintain balanced soil moisture levels."
          />
        </div>
      </div>

      {/* Weather Telemetry Overview Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Current Telemetry — {location.city}</span>
          </h2>
          <NavLink to="/weather" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
            <span>View 5-Day Outlook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {loadingWeather ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse">
            Fetching weather telemetry for {location.city}...
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Temperature"
              value={`${currWeather?.temp || 28} °C`}
              subtitle={`Feels like ${currWeather?.feels_like || 30} °C`}
              icon={Thermometer}
              color="amber"
              badge={currWeather?.description || 'Clear'}
            />
            <MetricCard
              title="Humidity"
              value={`${currWeather?.humidity || 65} %`}
              subtitle="Relative soil-air moisture"
              icon={Droplets}
              color="blue"
            />
            <MetricCard
              title="Rain AI Prob"
              value={`${((rainInfo?.probability || 0.2) * 100).toFixed(0)} %`}
              subtitle={rainInfo?.rain_likely ? 'Rain Likely 🌧️' : 'Dry Outlook 🌤️'}
              icon={CloudRain}
              color="cyan"
              badge="XGBoost AI"
            />
            <MetricCard
              title="Wind Speed"
              value={`${currWeather?.wind_speed || 3.5} m/s`}
              subtitle="10m anemometer speed"
              icon={Wind}
              color="purple"
            />
          </div>
        )}
      </div>

      {/* Interactive Map & Site Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>Farm Site Coordinates & Location Map</span>
        </h2>
        <InteractiveMap />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Decision Support Modules</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <NavLink
            to="/crop-advisor"
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Crop Advisor</h3>
                <span className="text-[11px] text-emerald-400 font-semibold">RandomForest Model</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input Nitrogen, Phosphorus, Potassium, pH, and rainfall to discover the most suitable crop for your farm.
            </p>
          </NavLink>

          <NavLink
            to="/fertilizer-advisor"
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-xl bg-teal-500/15 text-teal-400 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Fertilizer Advisor</h3>
                <span className="text-[11px] text-teal-400 font-semibold">Nutrient Deficiency AI</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identify soil nutrient gaps and receive exact fertilizer dosages with agronomic safety overrides.
            </p>
          </NavLink>

          <NavLink
            to="/water-management"
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Water Management</h3>
                <span className="text-[11px] text-cyan-400 font-semibold">FAO-56 Penman-Monteith</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculate daily reference evapotranspiration (ET0) and crop water requirements to optimize irrigation.
            </p>
          </NavLink>

          <NavLink
            to="/frost-risk"
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 group-hover:scale-110 transition-transform">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Frost Risk Alarm</h3>
                <span className="text-[11px] text-rose-400 font-semibold">XGBoost Classifier</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Predict localized cold wave and frost risks for 20 Indian agricultural regions with proactive advisories.
            </p>
          </NavLink>

          <NavLink
            to="/yield-prediction"
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Yield Predictor</h3>
                <span className="text-[11px] text-amber-400 font-semibold">DecisionTree Regressor</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estimate harvest production in tonnes per hectare based on land area, rainfall, and pesticide usage.
            </p>
          </NavLink>

          <NavLink
            to="/market-prices"
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Market Price Advisor</h3>
                <span className="text-[11px] text-purple-400 font-semibold">Stacking Ensemble AI</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forecast wholesale commodity mandi prices per quintal and receive supply chain logistics recommendations.
            </p>
          </NavLink>

        </div>
      </div>

    </div>
  );
};
