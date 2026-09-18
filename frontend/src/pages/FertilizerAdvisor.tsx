import React, { useState } from 'react';
import { FlaskConical, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { api } from '../services/api';
import type { FertilizerRecommendation } from '../types';

export const FertilizerAdvisor: React.FC = () => {
  const [cropType, setCropType] = useState<string>('Wheat');
  const [soilType, setSoilType] = useState<string>('Loamy Soil');
  const [temp] = useState<number>(26.0);
  const [humidity] = useState<number>(52.0);
  const [moisture, setMoisture] = useState<number>(38.0);
  const [n, setN] = useState<number>(37);
  const [p, setP] = useState<number>(20);
  const [k, setK] = useState<number>(20);
  const [ph, setPh] = useState<number>(6.5);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FertilizerRecommendation | null>(null);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      temperature: temp,
      humidity,
      moisture,
      soil_type: soilType,
      crop_type: cropType,
      nitrogen: n,
      phosphorous: p,
      potassium: k,
      ph
    };

    try {
      const res = await api.recommendFertilizer(payload);
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold mb-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Fertilizer Advisory System</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Fertilizer Guide</h1>
        <p className="text-xs text-slate-400 mt-1">
          Identify soil nutrient deficiencies and receive exact dosage guidelines with agronomic safety overrides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <form onSubmit={handleRecommend} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Type</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {['Wheat', 'Rice', 'Maize', 'Barley', 'Millet', 'Sugarcane', 'Cotton', 'Tea', 'Coffee', 'Apple', 'Banana', 'Mango'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {['Loamy Soil', 'Sandy Soil', 'Neutral Soil', 'Clay Soil', 'Acidic Soil', 'Alkaline Soil'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">🧪 Current Soil Nutrients</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nitrogen (N)</label>
                  <input
                    type="number"
                    step="any"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Phosphorus (P)</label>
                  <input
                    type="number"
                    step="any"
                    value={p}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Potassium (K)</label>
                  <input
                    type="number"
                    step="any"
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Soil pH</span>
                  <span className="font-mono text-amber-400 font-bold">{ph}</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Soil Moisture (%)</span>
                  <span className="font-mono text-cyan-400 font-bold">{moisture} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Evaluating Fertilizer Model...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recommend Fertilizer</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-4">
              
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-teal-500/40 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold">
                    🤖 {result.source}
                  </span>
                  <span className="text-xs text-slate-400">
                    Confidence: <b className="text-emerald-400">{(result.confidence * 100).toFixed(0)}%</b>
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Recommended Fertilizer</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
                    🧪 {result.recommended_fertilizer}
                  </h2>
                </div>

                <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs text-slate-200 leading-relaxed">
                  <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Agronomic Diagnosis</span>
                  </div>
                  {result.explanation || result.advice}
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span>Application Guidance & Dosage Notice</span>
                  </h4>
                  <p className="leading-relaxed text-slate-400">
                    Always apply chemical fertilizers based on soil moisture availability and localized agricultural officer guidance. Avoid over-application to prevent nutrient runoff and soil acidification.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Fertilizer Diagnosis Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Set your crop type, soil pH, and NPK levels on the left to receive a custom fertilizer recommendation.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
