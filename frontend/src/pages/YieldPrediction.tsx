import React, { useState } from 'react';
import { Tractor, Sparkles, Award } from 'lucide-react';
import { api } from '../services/api';
import type { YieldPrediction } from '../types';

const CROPS = ['Maize', 'Rice, paddy', 'Wheat', 'Potatoes', 'Sorghum', 'Soybeans', 'Cassava', 'Sweet potatoes'];

export const YieldPredictionPage: React.FC = () => {
  const [crop, setCrop] = useState<string>('Maize');
  const [areaHa, setAreaHa] = useState<number>(5.0);
  const [rainfall, setRainfall] = useState<number>(1200.0);
  const [pesticides, setPesticides] = useState<number>(10.0);
  const [temp, setTemp] = useState<number>(25.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<YieldPrediction | null>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      crop,
      area_ha: areaHa,
      annual_rainfall: rainfall,
      pesticides_tonnes: pesticides,
      avg_temp: temp
    };

    try {
      const res = await api.predictYield(payload);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
          <Tractor className="w-3.5 h-3.5" />
          <span>Harvest & Yield Forecasting Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Agricultural Yield Predictor</h1>
        <p className="text-xs text-slate-400 mt-1">
          Estimate harvest yields (in hg/ha and total Tonnes) using trained DecisionTree Machine Learning models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <form onSubmit={handleEstimate} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cultivation Area (Hectares)</label>
              <input
                type="number"
                min="0.1"
                max="10000"
                step="0.5"
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Annual Rainfall (mm)</span>
                  <span className="font-mono text-amber-400 font-bold">{rainfall} mm</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="4000"
                  step="50"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Pesticides Usage (Tonnes)</span>
                  <span className="font-mono text-amber-400 font-bold">{pesticides} T</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  value={pesticides}
                  onChange={(e) => setPesticides(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Average Temperature (°C)</span>
                  <span className="font-mono text-teal-400 font-bold">{temp} °C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Executing Yield Decision Tree...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Estimate Harvest Yield</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-md space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  🤖 {result.source}
                </span>
                <span className="text-xs text-slate-400">
                  Area: <b className="text-white">{areaHa} Ha</b>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Yield (hg/ha)</span>
                  <div className="text-lg font-black text-amber-400 mt-1 font-mono">
                    {result.predicted_yield_hg_per_ha.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tonnes / Hectare</span>
                  <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
                    {result.yield_tonnes_per_ha} T
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Harvest</span>
                  <div className="text-lg font-black text-cyan-400 mt-1 font-mono">
                    {result.total_production_tonnes} Tonnes
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-slate-200 leading-relaxed">
                <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Yield Benchmark Evaluation</span>
                </div>
                {result.yield_evaluation}
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Tractor className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Harvest Yield Prediction Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your target crop, cultivation area in hectares, and rainfall parameters on the left.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
