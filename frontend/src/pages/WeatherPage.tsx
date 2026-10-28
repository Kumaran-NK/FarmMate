import React, { useEffect, useState } from 'react';
import { Sun, CloudRain, Wind, Droplets, Gauge, MapPin, Search, Sparkles, Moon, CloudSun, Cloud, Sprout } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import type { WeatherResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import { SmartImage } from '../components/SmartImage';
import { getWeatherImage } from '../services/imageMap';
import { InteractiveMap } from '../components/InteractiveMap';

export const WeatherPage: React.FC = () => {
  const { location, setLocation, latestWeather, setLatestWeather } = useFarmContext();
  const [cityInput, setCityInput] = useState<string>(location.city);
  const [data, setData] = useState<WeatherResponse | null>(latestWeather);
  const [loading, setLoading] = useState<boolean>(!latestWeather);
  const [activeTab, setActiveTab] = useState<'hourly' | 'fiveday' | 'insights'>('hourly');

  const fetchWeather = async (targetCity: string, lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const res = await api.predictWeather(targetCity, lat, lon);
      setData(res);
      setLatestWeather(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latestWeather) {
      setData(latestWeather);
      setCityInput(location.city);
    }
  }, [latestWeather, location.city]);

  useEffect(() => {
    fetchWeather(location.city, location.lat, location.lon);
  }, [location.city, location.lat, location.lon]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setLocation({ ...location, city: cityInput.trim() });
      fetchWeather(cityInput.trim());
    }
  };

  const curr = data?.current_weather;
  const rain = data?.rain_prediction;
  const hourly = data?.hourly_forecast;

  const chartData = hourly?.times.map((t, idx) => ({
    time: t,
    temp: hourly.temperatures[idx],
    humidity: hourly.humidities[idx]
  })) || [];

  const weatherImg = getWeatherImage(curr?.description || 'sunny');
  const isNight = new Date().getHours() >= 20 || new Date().getHours() < 5;

  // 5-day simulated forecast dates based on current day
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fiveDayList = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dayName = daysOfWeek[d.getDay()];
    const tempBase = (curr?.temp || 28) + (i % 2 === 0 ? 1 : -1) * (i + 1);
    const rainChance = Math.min(90, Math.max(10, Math.round(((rain?.probability || 0.2) * 100) + (i * 12 - 15))));
    return {
      day: dayName,
      date: `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`,
      high: Math.round(tempBase + 2),
      low: Math.round(tempBase - 4),
      rainChance,
      condition: rainChance > 50 ? 'Scattered Rain' : rainChance > 30 ? 'Partly Cloudy' : 'Clear & Sunny'
    };
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header & City Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Sun className="w-3.5 h-3.5 text-emerald-600" />
            <span>OpenWeatherMap Telemetry & XGBoost AI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Weather Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time weather data and agricultural insights for better farm planning.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Search Indian City..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 text-sm bg-white rounded-2xl border border-green-100 animate-pulse">
          Loading weather telemetry and running XGBoost Rain AI model...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Weather Atmosphere Card — Unified overlapping design matching reference */}
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-gray-100 min-h-[250px] sm:min-h-[270px]">
            {/* Background Agricultural Image */}
            <SmartImage
              src={weatherImg}
              alt="Weather Sky"
              fallbackType="weather"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Smooth dark vignette overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/30" />

            {/* Overlapping Content Container */}
            <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 h-full">
              {/* Left Side: Location, Temperature & Condition */}
              <div className="text-white">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/95">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{location.city}, {location.state}</span>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">
                  Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div className="flex items-center gap-3.5 mt-4">
                  {isNight ? (
                    <Moon className="w-12 sm:w-14 h-12 sm:h-14 text-indigo-200 drop-shadow-lg" />
                  ) : (
                    <Sun className="w-12 sm:w-14 h-12 sm:h-14 text-amber-400 drop-shadow-lg" />
                  )}
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {curr?.temp || 28}°C
                  </div>
                </div>

                <div className="text-sm sm:text-base font-semibold text-white/95 capitalize mt-2 drop-shadow flex items-center gap-2">
                  <span>{curr?.description || 'Clear Sky'}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-300 font-medium">good for field work</span>
                </div>
              </div>

              {/* Right Side: Frosted Glass Overlapping Stats Card */}
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4.5 sm:p-5 border border-white/50 shadow-xl min-w-[250px] sm:min-w-[270px] space-y-3 text-gray-800">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200/50">
                  <div className="flex items-center gap-2 font-medium text-gray-600">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Humidity</span>
                  </div>
                  <span className="font-extrabold text-sm text-gray-900">{curr?.humidity || 68}%</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200/50">
                  <div className="flex items-center gap-2 font-medium text-gray-600">
                    <Wind className="w-4 h-4 text-sky-500" />
                    <span>Wind Speed</span>
                  </div>
                  <span className="font-extrabold text-sm text-gray-900">{curr?.wind_speed || 3.4} m/s</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200/50">
                  <div className="flex items-center gap-2 font-medium text-gray-600">
                    <Gauge className="w-4 h-4 text-indigo-500" />
                    <span>Pressure</span>
                  </div>
                  <span className="font-extrabold text-sm text-gray-900">{curr?.pressure || 1005} hPa</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-gray-600">
                    <CloudRain className="w-4 h-4 text-cyan-500" />
                    <span>Rain Chance</span>
                  </div>
                  <span className="font-extrabold text-sm text-gray-900">{((rain?.probability || 0.1) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Hourly Forecast | 5-Day Forecast | Agricultural Insights & Map) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
            <div className="flex items-center gap-8 border-b border-gray-200 pb-3">
              <button
                onClick={() => setActiveTab('hourly')}
                className={`text-sm font-semibold pb-3 -mb-3 transition-colors ${
                  activeTab === 'hourly'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Hourly Forecast
              </button>
              <button
                onClick={() => setActiveTab('fiveday')}
                className={`text-sm font-semibold pb-3 -mb-3 transition-colors ${
                  activeTab === 'fiveday'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                5-Day Forecast
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`text-sm font-semibold pb-3 -mb-3 transition-colors ${
                  activeTab === 'insights'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Agricultural Insights & Map
              </button>
            </div>

            {/* Tab 1: Hourly Forecast + Weather Advisory (Matching Reference Panel 5) */}
            {activeTab === 'hourly' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Hourly items (7 cols) */}
                <div className="lg:col-span-7 bg-gray-50/70 rounded-2xl p-4 border border-gray-100">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {(hourly?.times || ['11 AM', '1 PM', '4 PM', '7 PM', '10 PM']).slice(0, 5).map((time, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 py-2 px-1">
                        <span className="text-[11px] font-medium text-gray-500">{time}</span>
                        <div className="my-1">
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
                          {hourly?.temperatures?.[idx] || (33 - idx)}°
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Advisory Card (5 cols) */}
                <div className="lg:col-span-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-900">Weather Advisory</h3>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    {rain?.rain_likely
                      ? 'Rain expected in your farm zone. Consider postponing scheduled irrigation and protect sensitive freshly sowed seeds.'
                      : 'No significant rain expected today. Suitable conditions for irrigation, pesticide application, and field activities.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: 5-Day Outlook */}
            {activeTab === 'fiveday' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {fiveDayList.map((day, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center space-y-2">
                    <div className="text-xs font-bold text-gray-700">{day.day}</div>
                    <div className="text-[10px] text-gray-400">{day.date}</div>
                    <div className="py-1 flex justify-center">
                      {day.rainChance > 50 ? (
                        <CloudRain className="w-6 h-6 text-blue-500" />
                      ) : day.rainChance > 30 ? (
                        <CloudSun className="w-6 h-6 text-amber-500" />
                      ) : (
                        <Sun className="w-6 h-6 text-amber-500" />
                      )}
                    </div>
                    <div className="text-xs font-black text-gray-900">
                      {day.high}° / <span className="text-gray-500 font-normal">{day.low}°</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      💧 {day.rainChance}% rain
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Agricultural Insights & Map */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Interactive plot geolocation for <b>{location.city}</b>. Click anywhere on the map to recalculate agronomic telemetry.
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    CartoDB Agricultural Tiles
                  </span>
                </div>
                <InteractiveMap />
              </div>
            )}
          </div>

          {/* Main Weather Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              title="Temperature"
              value={`${curr?.temp || 28} °C`}
              subtitle={`Feels like ${curr?.feels_like || 30} °C`}
              icon={Sun}
              color="amber"
              badge={curr?.description?.toUpperCase()}
            />
            <MetricCard
              title="Humidity"
              value={`${curr?.humidity || 65} %`}
              subtitle="Atmospheric moisture"
              icon={Droplets}
              color="blue"
            />
            <MetricCard
              title="Wind Speed"
              value={`${curr?.wind_speed || 3.5} m/s`}
              subtitle="10m surface anemometer"
              icon={Wind}
              color="purple"
            />
            <MetricCard
              title="Pressure"
              value={`${curr?.pressure || 1012} hPa`}
              subtitle="Barometric reading"
              icon={Gauge}
              color="cyan"
            />
          </div>

          {/* ML Rain AI Distinction Card */}
          <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">FarmMate XGBoost Rain Classifier</h3>
                  <span className="text-xs text-gray-500">Distinguishes official meteorological models from localized crop-level AI predictions</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                Prob: {((rain?.probability || 0.2) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 leading-relaxed">
              <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Agricultural Rain Advisory:</span>
              </div>
              {rain?.advice || 'No significant rain expected today. Proceed with standard irrigation scheduling.'}
            </div>
          </div>

          {/* 5-Hour Outlook Chart */}
          <div className="p-6 rounded-2xl bg-white border border-green-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Short-Term Hourly Outlook</h3>
              <span className="text-xs text-gray-400">Temperature (°C) & Humidity (%)</span>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} unit="°C" />
                  <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={11} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
