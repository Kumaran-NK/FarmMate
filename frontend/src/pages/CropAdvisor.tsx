import React, { useState } from 'react';
import { Sprout, ChevronDown, ChevronUp, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api } from '../services/api';
import type { CropRecommendation } from '../types';
import { useFarmContext } from '../context/FarmContext';
import { SmartImage } from '../components/SmartImage';

const CROP_IMAGES: Record<string, string> = {
  Rice: 'https://images.unsplash.com/photo-1536637175371-cc52b364817a?q=80&w=800&auto=format&fit=crop',
  Maize: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=800&auto=format&fit=crop',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop',
  Coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?q=80&w=800&auto=format&fit=crop',
  Apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=800&auto=format&fit=crop',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop',
  Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800&auto=format&fit=crop',
  Jute: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800&auto=format&fit=crop',
  Coconut: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop';

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
  const cropImg = CROP_IMAGES[cropName] || DEFAULT_IMAGE;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>Smart Crop Recommendation Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Crop Advisor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Determine the most suitable crop to cultivate based on soil nutrients and micro-climate parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">🧪 Soil Nutrient Test (ppm)</h3>
            </div>

            {/* Nitrogen */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Nitrogen (N)</label>
                <span className="font-mono text-emerald-400 font-bold">{n} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-[10px] text-slate-400 mt-1">Nitrogen promotes leaf growth and plant vigor.</p>
            </div>

            {/* Phosphorus */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Phosphorus (P)</label>
                <span className="font-mono text-emerald-400 font-bold">{p} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-[10px] text-slate-400 mt-1">Phosphorus aids root development and flowering.</p>
            </div>

            {/* Potassium */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Potassium (K)</label>
                <span className="font-mono text-emerald-400 font-bold">{k} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-[10px] text-slate-400 mt-1">Potassium builds disease resistance and fruit quality.</p>
            </div>

            {/* Soil pH */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Soil pH Level</label>
                <span className="font-mono text-amber-400 font-bold">{ph}</span>
              </div>
              <input
                type="range"
                min="3.5"
                max="9.5"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-[10px] text-slate-400 mt-1">Acidic (&lt;6.0), Neutral (6.0 - 7.5), Alkaline (&gt;7.5).</p>
            </div>

            <div className="border-b border-slate-800 pt-2 pb-3">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">🌤️ Micro-Climate</h3>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Average Temperature (°C)</label>
                <span className="font-mono text-teal-400 font-bold">{temp} °C</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-teal-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Humidity */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Humidity (%)</label>
                <span className="font-mono text-teal-400 font-bold">{humidity} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-teal-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Rainfall */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-200">Annual Rainfall (mm)</label>
                <span className="font-mono text-teal-400 font-bold">{rainfall} mm</span>
              </div>
              <input
                type="number"
                step="any"
                min="10"
                max="3500"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Advanced Section Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1"
            >
              <span>{showAdvanced ? 'Hide Advanced Agronomic Inputs' : 'Show Advanced Agronomic Inputs'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="loamy">Loamy Soil</option>
                    <option value="clayey">Clayey Soil</option>
                    <option value="sandy">Sandy Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Analyzing Soil & Climate Features...</span>
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
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              
              {/* Main Crop Card */}
              <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/40 overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <SmartImage
                    src={cropImg}
                    alt={cropName}
                    fallbackType="crop"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                        {result.source}
                      </span>
                      <h2 className="text-3xl font-extrabold text-white mt-1">🌾 {cropName}</h2>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-300">Match Confidence</div>
                      <div className="text-2xl font-black text-emerald-400">
                        {(result.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Ideal Temperature</span>
                      <div className="text-sm font-semibold text-white mt-0.5">18°C - 32°C</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Water Need</span>
                      <div className="text-sm font-semibold text-white mt-0.5">Moderate - High</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Soil pH Range</span>
                      <div className="text-sm font-semibold text-white mt-0.5">6.0 - 7.2</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
                    <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Why is {cropName} recommended?</span>
                    </div>
                    Your soil sample (N: {n}, P: {p}, K: {k}, pH: {ph}) combined with local rainfall ({rainfall} mm) provides high agronomic compatibility for optimal root formation and maximum harvest potential.
                  </div>
                </div>
              </div>

              {/* Top 5 Candidate Crops Chart */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 5 Candidate Crops</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" fontSize={11} />
                      <YAxis dataKey="crop" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#334155'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Ready for Agronomic Soil Analysis</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Adjust your NPK nutrient sliders and rainfall on the left, then click <b>Recommend Optimal Crop</b> to view predictions.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
