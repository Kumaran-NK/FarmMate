import React, { useState } from 'react';
import { Sprout, ChevronDown, ChevronUp, Sparkles, AlertCircle, CheckCircle2, Droplets, Thermometer, Gauge } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api } from '../services/api';
import type { CropRecommendation } from '../types';
import { useFarmContext } from '../context/FarmContext';
import { SmartImage } from '../components/SmartImage';
import { getCropImage } from '../services/imageMap';

export const CropAdvisor: React.FC = () => {
  const { setLatestCropPrediction } = useFarmContext();

  // Form Inputs
  const [n, setN] = useState<number>(90);
  const [p, setP] = useState<number>(42);
  const [k, setK] = useState<number>(43);
  const [ph, setPh] = useState<number>(6.5);
  const [temp, setTemp] = useState<number>(20.8);
  const [humidity, setHumidity] = useState<number>(82.0);
  const [rainfall, setRainfall] = useState<number>(202.9);

  // Advanced inputs
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [soilType, setSoilType] = useState<string>('loamy');
  const [growthStage, setGrowthStage] = useState<string>('vegetative');

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CropRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      N: n,
      P: p,
      K: k,
      ph: ph,
      temperature: temp,
      humidity: humidity,
      rainfall: rainfall,
      soil_type: soilType,
      growth_stage: growthStage
    };

    try {
      const res = await api.recommendCrop(payload);
      setResult(res);
      setLatestCropPrediction(res);
    } catch (err) {
      setError('Could not complete recommendation. Please check your soil inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.top5_recommendations?.map(([crop, prob]) => ({
    crop,
    probability: Math.round(prob * 100)
  })) || [];

  const cropName = result?.predicted_crop || 'Rice';
  const cropImg = getCropImage(cropName);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>AI Agronomic Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Crop Advisor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Determine the highest-yielding crop for your soil chemistry and local climatic conditions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-green-100 rounded-2xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Soil Nutrient Test (ppm)
              </h3>
            </div>

            {/* Nitrogen */}
            <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100/60">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700">Nitrogen (N)</label>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{n} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">Promotes vigorous leaf and vegetative stem growth.</p>
            </div>

            {/* Phosphorus */}
            <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100/60">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700">Phosphorus (P)</label>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{p} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">Stimulates deep root establishment and early blossom set.</p>
            </div>

            {/* Potassium */}
            <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100/60">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700">Potassium (K)</label>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{k} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">Improves drought tolerance, stalk rigidity, and disease resistance.</p>
            </div>

            {/* Soil pH */}
            <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-100/60">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700">Soil pH Level</label>
                <span className="font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{ph}</span>
              </div>
              <input
                type="range"
                min="3.5"
                max="9.5"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">Optimal agronomic neutral target: 6.0 - 7.2 pH.</p>
            </div>

            <div className="border-b border-gray-100 pt-2 pb-3">
              <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Climate & Precipitation
              </h3>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                  Average Temperature (°C)
                </label>
                <span className="font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold">{temp} °C</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Humidity */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-teal-600" />
                  Relative Humidity (%)
                </label>
                <span className="font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold">{humidity} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Rainfall */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-teal-600" />
                  Annual Rainfall (mm)
                </label>
                <span className="font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold">{rainfall} mm</span>
              </div>
              <input
                type="number"
                step="any"
                min="10"
                max="3500"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Advanced Section Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-emerald-700 font-medium transition-colors pt-1"
            >
              <span>{showAdvanced ? 'Hide Advanced Agronomic Inputs' : 'Show Advanced Agronomic Inputs'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Soil Texture / Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="loamy">Loamy Soil (Balanced drainage & nutrients)</option>
                    <option value="clayey">Clayey Soil (High moisture retention)</option>
                    <option value="sandy">Sandy Soil (High aeration & rapid drainage)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Target Crop Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="vegetative">Vegetative Stage</option>
                    <option value="flowering">Flowering Stage</option>
                    <option value="seedling">Seedling Stage</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Running Machine Learning Inference...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recommend Optimal Crop</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              {/* Main Crop Card */}
              <div className="rounded-2xl bg-white border border-green-200 overflow-hidden shadow-sm">
                <div className="relative h-60 sm:h-64 overflow-hidden bg-gray-100">
                  <SmartImage
                    src={cropImg}
                    alt={cropName}
                    fallbackType="crop"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="px-2.5 py-1 rounded-full bg-white/90 text-emerald-800 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                        {result.source || 'ML Inference'}
                      </span>
                      <h2 className="text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2">
                        <span>{cropName}</span>
                      </h2>
                    </div>

                    <div className="text-right bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20">
                      <div className="text-[11px] text-gray-200">Suitability Match</div>
                      <div className="text-2xl font-black text-emerald-300">
                        {(result.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-green-50/60 border border-green-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Ideal Temp</span>
                      <div className="text-sm font-bold text-gray-900 mt-0.5">18°C - 32°C</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Water Need</span>
                      <div className="text-sm font-bold text-gray-900 mt-0.5">Moderate - High</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Optimal pH</span>
                      <div className="text-sm font-bold text-gray-900 mt-0.5">6.0 - 7.2</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-gray-700 leading-relaxed">
                    <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Why is {cropName} recommended?</span>
                    </div>
                    Your soil profile (N: {n}, P: {p}, K: {k}, pH: {ph}) combined with precipitation ({rainfall} mm) provides high agronomic alignment for healthy root establishment and maximum harvest index.
                  </div>
                </div>
              </div>

              {/* Top 5 Candidate Crops Chart */}
              <div className="p-6 rounded-2xl bg-white border border-green-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Top 5 Agronomic Candidates</h3>
                  <span className="text-xs text-gray-400">Random Forest Classifier Confidence</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 100]} unit="%" stroke="#9ca3af" fontSize={11} />
                      <YAxis dataKey="crop" type="category" stroke="#4b5563" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Ready for Soil & Climate Analysis</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Adjust the N-P-K nutrient sliders and local precipitation parameters on the left, then click <b>Recommend Optimal Crop</b> to generate AI recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
