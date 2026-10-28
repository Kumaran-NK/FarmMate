import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getWeatherImage } from '../services/imageMap';
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
  FileText,
  Snowflake,
  Wind,
  Gauge,
  CloudRain,
  CloudSun,
  Cloud,
  Moon
} from 'lucide-react';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import type { WeatherResponse } from '../types';
import { AlertBanner } from '../components/AlertBanner';
import { InteractiveMap } from '../components/InteractiveMap';

// Use centralized night-aware weather image resolver
const getDashboardWeatherImage = (condition?: string) => {
  return getWeatherImage(condition || new Date().getHours());
};

export const Dashboard: React.FC = () => {
  const { location, latestWeather, setLatestWeather, latestCropPrediction, weatherCondition } = useFarmContext();
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(latestWeather);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const handleExportPdf = async () => {
    setDownloadingPdf(true);
    try {
      await api.downloadPdfReport({
        city: location.city,
        state: location.state,
        n: 90,
        p: 42,
        k: 43,
        ph: 6.5,
        rainfall: 1200,
        recommended_crop: latestCropPrediction?.predicted_crop || 'Rice',
        confidence: latestCropPrediction ? (latestCropPrediction.probability * 100).toFixed(1) : 94.5,
        temp: weatherData?.current_weather.temp || 28,
        rain_prob: weatherData?.rain_prediction.probability ? `${(weatherData.rain_prediction.probability * 100).toFixed(0)}%` : '20%',
        et0: '4.8'
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (latestWeather) {
      setWeatherData(latestWeather);
    }
  }, [latestWeather]);

  useEffect(() => {
    let isMounted = true;
    api.predictWeather(location.city, location.lat, location.lon).then((data) => {
      if (isMounted) {
        setWeatherData(data);
        setLatestWeather(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [location.city, location.lat, location.lon]);

  const currWeather = weatherData?.current_weather;
  const rainInfo = weatherData?.rain_prediction;
  const hourlyForecast = weatherData?.hourly_forecast;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const weatherImage = getDashboardWeatherImage(weatherCondition);

  return (
    <div className="space-y-6 pb-8">
      
      {/* Top Welcome Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            {getGreeting()}, User 🌱
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's what's happening with your farm today.
          </p>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Weather Section — layout matching 3rd reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Weather Image Card + Forecast Below Image (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Weather Card */}
          <div className="farm-card overflow-hidden relative shadow-sm border border-gray-100/80">
            <div className="relative h-56 overflow-hidden rounded-2xl">
              <img
                src={weatherImage}
                alt={`${weatherCondition || 'Weather'} field view`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
              
              {/* Weather Data Overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{location.city}, {location.state}</span>
                  </div>
                  <span className="text-[11px] text-white/80 font-medium bg-black/25 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                    Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      {new Date().getHours() >= 20 || new Date().getHours() < 5 ? (
                        <Moon className="w-10 h-10 text-indigo-200 drop-shadow" />
                      ) : (
                        <Sun className="w-10 h-10 text-amber-400 drop-shadow" />
                      )}
                      <div className="text-4xl sm:text-5xl font-black tracking-tight">{currWeather?.temp || 28}°C</div>
                    </div>
                    <div className="text-sm font-semibold text-white/90 capitalize mt-2 flex items-center gap-2">
                      <span>{currWeather?.description || 'Clear sky'}</span>
                      <span className="text-white/50">•</span>
                      <span className="text-emerald-300 font-medium">good for field work</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Forecast Card — Directly Below Image */}
          <div className="farm-card p-4.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3.5">Today</h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {(hourlyForecast?.times || ['11 AM', '1 PM', '4 PM', '7 PM', '10 PM']).slice(0, 5).map((time, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 py-1 px-1 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <span className="text-[11px] font-medium text-gray-500">{time}</span>
                  <div className="my-0.5">
                    {idx === 0 || idx === 1 ? (
                      <Sun className="w-5 h-5 text-amber-500" />
                    ) : idx === 2 ? (
                      <CloudSun className="w-5 h-5 text-amber-400" />
                    ) : idx === 3 ? (
                      <Cloud className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {hourlyForecast?.temperatures?.[idx] || (33 - idx)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 2x2 Metrics Grid + Field Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 2x2 Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Humidity */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500">Humidity</div>
                <div className="text-lg font-black text-gray-900 mt-0.5">{currWeather?.humidity || 68}%</div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500">Wind Speed</div>
                <div className="text-lg font-black text-gray-900 mt-0.5">{currWeather?.wind_speed || 3.4} m/s</div>
              </div>
            </div>

            {/* Pressure */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500">Pressure</div>
                <div className="text-lg font-black text-gray-900 mt-0.5">{currWeather?.pressure || 1005} hPa</div>
              </div>
            </div>

            {/* Rain Chance */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500">Rain Chance</div>
                <div className="text-lg font-black text-gray-900 mt-0.5">{((rainInfo?.probability || 0.1) * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Field Advisory Card — Directly Below the 2x2 Grid */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-emerald-900">Field Advisory</h3>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              {rainInfo?.rain_likely
                ? 'Rain expected in the next 24 hours. Consider postponing field irrigation and protect sensitive exposed seedlings.'
                : 'No significant rain expected today. Suitable conditions for irrigation and routine field activities.'}
            </p>
          </div>
        </div>

      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { icon: Sprout, label: 'Recommend Crop', sub: 'Find suitable crops', path: '/crop-advisor', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: FlaskConical, label: 'Fertilizer Advisory', sub: 'Get fertilizer suggestions', path: '/fertilizer-advisor', color: 'text-teal-600', bg: 'bg-teal-50' },
            { icon: Droplets, label: 'Irrigation Plan', sub: 'Calculate water needs', path: '/water-management', color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { icon: Snowflake, label: 'Check Frost Risk', sub: 'Frost risk assessment', path: '/frost-risk', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: TrendingUp, label: 'Market Prices', sub: 'Predict market prices', path: '/market-prices', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Tractor, label: 'Yield Prediction', sub: 'Estimate harvest', path: '/yield-prediction', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Bot, label: 'Ask AI Assistant', sub: 'Get farming advice', path: '/ai-assistant', color: 'text-green-600', bg: 'bg-green-50' },
          ].map((action, idx) => (
            <NavLink
              key={idx}
              to={action.path}
              className="farm-card p-4 flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={`p-3 rounded-xl ${action.bg} ${action.color} mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-800">{action.label}</span>
              <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{action.sub}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Interactive Farm Site & Telemetry Map */}
      <div className="farm-card p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Farm Coordinates & Location Map
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click anywhere on the map to pinpoint your exact farm location and synchronize micro-climate telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              GPS Synchronized
            </span>
            <span className="text-gray-500 font-medium">
              {location.city} ({location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°)
            </span>
          </div>
        </div>
        <InteractiveMap />
      </div>

      {/* Farm Alerts */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          Farm Health & Advisory
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rainInfo?.rain_likely ? (
            <AlertBanner
              type="rain"
              title="🌧️ Rain Expected in 24 Hours"
              message="High rain probability detected. Consider delaying scheduled irrigation."
            />
          ) : (
            <AlertBanner
              type="success"
              title="🌤️ Clear Skies & Optimal Conditions"
              message="No significant rainfall expected. Proceed with standard irrigation and maintenance."
            />
          )}

          <AlertBanner
            type="irrigation"
            title="💧 Evapotranspiration Advisory"
            message="Estimated daily crop water need is 5.2 mm. Maintain balanced soil moisture levels."
          />
        </div>
      </div>

      {/* Export & Location */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPdf}
          disabled={downloadingPdf}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-200 transition-all disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          <span>{downloadingPdf ? 'Generating PDF...' : 'Export PDF Report'}</span>
        </button>

        <NavLink
          to="/weather"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-green-300 text-xs font-semibold text-gray-700 transition-all"
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Full Weather Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

    </div>
  );
};
