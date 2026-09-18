import React, { useEffect, useState } from 'react';
import { Droplets, Calculator, Info, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import type { ET0Response } from '../types';
import { MetricCard } from '../components/MetricCard';

const CROPS_LIST = [
  'tomatoes', 'wheat', 'maize', 'potatoes', 'cabbage', 'cotton',
  'soybeans', 'barley', 'grass', 'vineyard', 'orchard'
];

export const WaterManagement: React.FC = () => {
  const { location } = useFarmContext();
  const [selectedCrop, setSelectedCrop] = useState<string>('tomatoes');
  const [data, setData] = useState<ET0Response | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchET0 = async (crop: string) => {
    setLoading(true);
    try {
      const res = await api.calculateET0({
        lat: location.lat,
        lon: location.lon,
        crop_name: crop
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchET0(selectedCrop);
  }, [location.lat, location.lon, selectedCrop]);

  const forecast = data?.forecast || [];
  const todayResult = forecast[0] || { et0_mm_day: 4.5, crop_water_need_mm_day: 5.18 };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Droplets className="w-3.5 h-3.5" />
            <span>FAO-56 Penman-Monteith Formulation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Water Management & ET0 Calculator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compute daily reference Evapotranspiration (ET0) and precise crop water requirements to plan irrigation schedules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-300">Target Crop:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white capitalize focus:outline-none focus:border-cyan-500"
          >
            {CROPS_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-slate-900/50 rounded-3xl border border-slate-800 animate-pulse">
          Calculating FAO-56 Penman-Monteith Evapotranspiration for {selectedCrop}...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Key Water Need Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Today's Crop Water Requirement"
              value={`${todayResult.crop_water_need_mm_day} mm`}
              subtitle={`Target crop: ${selectedCrop.toUpperCase()}`}
              icon={Droplets}
              color="cyan"
              badge={`Kc Factor: ${data?.crop_coefficient || 1.15}`}
            />
            <MetricCard
              title="Reference ET0"
              value={`${todayResult.et0_mm_day} mm/day`}
              subtitle="Grass reference evapotranspiration"
              icon={Calculator}
              color="blue"
            />
            <MetricCard
              title="5-Day Cumulative Need"
              value={`${forecast.reduce((acc, f) => acc + f.crop_water_need_mm_day, 0).toFixed(1)} mm`}
              subtitle="Total 5-day irrigation requirement"
              icon={Calendar}
              color="emerald"
            />
          </div>

          {/* Simple Language Explanation */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-xl backdrop-blur-md space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <span>Daily Irrigation Recommendation</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your estimated crop water requirement for <b>{selectedCrop.toUpperCase()}</b> today is <b>{todayResult.crop_water_need_mm_day} mm</b>. 
              (1 mm equals 1 liter of water per square meter of crop field). Adjust your irrigation valves accordingly and check for unexpected rainfall.
            </p>
          </div>

          {/* Recharts Bar Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">5-Day Forecast: Reference ET0 vs Crop Water Need</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" mm" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="et0_mm_day" name="Reference ET0 (mm/day)" fill="#0288d1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="crop_water_need_mm_day" name="Crop Water Need (mm/day)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
