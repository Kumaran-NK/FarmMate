import React, { useEffect, useState } from 'react';
import { Sun, CloudRain, Wind, Droplets, Gauge, MapPin, Search, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import type { WeatherResponse } from '../types';
import { MetricCard } from '../components/MetricCard';

export const WeatherPage: React.FC = () => {
  const { location, setLocation } = useFarmContext();
  const [cityInput, setCityInput] = useState<string>(location.city);
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWeather = async (targetCity: string) => {
    setLoading(true);
    try {
      const res = await api.predictWeather(targetCity);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location.city);
  }, [location.city]);

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

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* Header & City Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
            <Sun className="w-3.5 h-3.5" />
            <span>Telemetry & XGBoost Rain AI</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Weather Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time OpenWeatherMap telemetry paired with XGBoost machine-learning rain classification.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Search Indian City..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-lg"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-slate-900/50 rounded-3xl border border-slate-800 animate-pulse">
          Loading weather telemetry and running XGBoost Rain AI model...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Weather Telemetry Metrics */}
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
              subtitle="Relative atmospheric moisture"
              icon={Droplets}
              color="blue"
            />
            <MetricCard
              title="Wind Speed"
              value={`${curr?.wind_speed || 3.5} m/s`}
              subtitle="10m anemometer speed"
              icon={Wind}
              color="purple"
            />
            <MetricCard
              title="Pressure"
              value={`${curr?.pressure || 1012} hPa`}
              subtitle="Barometric pressure"
              icon={Gauge}
              color="cyan"
            />
          </div>

          {/* ML Rain AI Distinction Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">FarmMate XGBoost Rain Classifier</h3>
                  <span className="text-[11px] text-slate-400">Distinguishes official API forecast from localized ML predictions</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                Prob: {((rain?.probability || 0.2) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Agricultural Rain Advisory:</span>
              </div>
              {rain?.advice || 'No significant rain expected today. Proceed with standard irrigation scheduling.'}
            </div>
          </div>

          {/* 5-Hour Outlook Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Short-Term Hourly Outlook</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} unit="°C" />
                  <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
