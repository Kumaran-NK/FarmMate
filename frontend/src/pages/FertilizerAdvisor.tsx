import React, { useState } from 'react';
import { FlaskConical, Sparkles, CheckCircle2, Beaker, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import type { FertilizerRecommendation } from '../types';
import { SmartImage } from '../components/SmartImage';
import { getFertilizerImage } from '../services/imageMap';

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

  const fertImg = result ? getFertilizerImage(result.recommended_fertilizer) : '';

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Nutrient Deficit & Dosage Advisor</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Fertilizer Guide</h1>
          <p className="text-sm text-gray-500 mt-1">
            Calculate precise fertilizer formulations based on active crop demands, soil pH, and soil moisture.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-green-100 rounded-2xl p-6 shadow-sm space-y-5">
          <form onSubmit={handleRecommend} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cultivated Crop</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {['Wheat', 'Rice', 'Maize', 'Barley', 'Millet', 'Sugarcane', 'Cotton', 'Tea', 'Coffee', 'Apple', 'Banana', 'Mango'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {['Loamy Soil', 'Sandy Soil', 'Neutral Soil', 'Clay Soil', 'Acidic Soil', 'Alkaline Soil'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Beaker className="w-3.5 h-3.5 text-teal-600" />
                Current Soil Nutrients (kg/ha or ppm)
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nitrogen (N)</label>
                  <input
                    type="number"
                    step="any"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phosphorus (P)</label>
                  <input
                    type="number"
                    step="any"
                    value={p}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Potassium (K)</label>
                  <input
                    type="number"
                    step="any"
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-4">
              <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold">Soil pH</span>
                  <span className="font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{ph}</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="bg-cyan-50/40 p-3 rounded-xl border border-cyan-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold">Soil Moisture (%)</span>
                  <span className="font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">{moisture} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Evaluating Fertilizer Recommendation Model...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recommend Fertilizer Formulation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-teal-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                    🤖 {result.source || 'Agronomic Classifier'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Confidence: <b className="text-teal-700 font-bold">{(result.confidence * 100).toFixed(0)}%</b>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-center">
                  <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <SmartImage
                      src={fertImg}
                      alt={result.recommended_fertilizer}
                      fallbackType="fertilizer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Recommended Fertilizer</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                      {result.recommended_fertilizer}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Specifically tailored to rebalance nutrient equilibrium for {cropType} on {soilType}.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed">
                  <div className="font-bold text-teal-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Agronomic Diagnosis</span>
                  </div>
                  {result.explanation || result.advice}
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-gray-700 space-y-2">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Application Safety & Dosage Notice</span>
                  </h4>
                  <p className="leading-relaxed text-gray-600">
                    Always apply chemical fertilizers when soil moisture is adequate. Over-application can cause root burn, fertilizer runoff, or groundwater nitrate buildup.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Fertilizer Diagnosis Ready</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Set your target crop, soil type, and nutrient levels on the left to obtain tailored fertilizer guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
