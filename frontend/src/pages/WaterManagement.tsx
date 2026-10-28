import React, { useEffect, useState } from 'react';
import { Droplets, Calculator, Info, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import type { ET0Response } from '../types';
import { MetricCard } from '../components/MetricCard';
import { SmartImage } from '../components/SmartImage';
import { getCropImage } from '../services/imageMap';

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
  const cropImg = getCropImage(selectedCrop);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold mb-2">
            <Droplets className="w-3.5 h-3.5" />
            <span>FAO-56 Penman-Monteith Formulation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Water Management & ET0</h1>
          <p className="text-sm text-gray-500 mt-1">
            Compute reference Evapotranspiration (ET0) and precise crop water requirements for optimal irrigation scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
            <SmartImage src={cropImg} alt={selectedCrop} fallbackType="crop" className="w-full h-full object-cover" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-transparent font-bold text-gray-900 text-xs capitalize focus:outline-none cursor-pointer"
            >
              {CROPS_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 text-sm bg-white rounded-2xl border border-green-100 animate-pulse">
          Calculating FAO-56 Penman-Monteith Evapotranspiration for {selectedCrop}...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Water Need Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Today's Water Requirement"
              value={`${todayResult.crop_water_need_mm_day} mm`}
              subtitle={`Active crop: ${selectedCrop.toUpperCase()}`}
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
              title="5-Day Cumulative Requirement"
              value={`${forecast.reduce((acc, f) => acc + f.crop_water_need_mm_day, 0).toFixed(1)} mm`}
              subtitle="Sum of next 5-day cycle"
              icon={Calendar}
              color="emerald"
            />
          </div>

          {/* Simple Language Explanation */}
          <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 space-y-2">
            <h3 className="text-sm font-bold text-cyan-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-600" />
              <span>Daily Irrigation Guidance</span>
            </h3>
            <p className="leading-relaxed text-gray-700">
              Your estimated crop water requirement for <b>{selectedCrop.toUpperCase()}</b> today is <b>{todayResult.crop_water_need_mm_day} mm</b>. 
              (1 mm equals 1 liter of water per square meter of field). Check your local precipitation forecasts before opening high-capacity drip or sprinkler lines.
            </p>
          </div>

          {/* Recharts Bar Chart */}
          <div className="p-6 rounded-2xl bg-white border border-green-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">5-Day Forecast: Reference ET0 vs Crop Water Need</h3>
              <span className="text-xs text-gray-400">Values in mm/day</span>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" mm" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="et0_mm_day" name="Reference ET0 (mm/day)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
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
