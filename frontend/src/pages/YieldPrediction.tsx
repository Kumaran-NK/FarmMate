import React, { useState } from 'react';
import { Tractor, Sparkles, Award, Scale, CloudRain, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import type { YieldPrediction } from '../types';
import { SmartImage } from '../components/SmartImage';
import { getCropImage } from '../services/imageMap';

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

  const cropImg = getCropImage(crop);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <Tractor className="w-3.5 h-3.5" />
            <span>DecisionTree ML Inference</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Agricultural Yield Predictor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Forecast total farm tonnage and harvest density per hectare based on acreage, rainfall, and thermal conditions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-green-100 rounded-2xl p-6 shadow-sm space-y-5">
          <form onSubmit={handleEstimate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Harvest Crop</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <SmartImage src={cropImg} alt={crop} fallbackType="crop" className="w-full h-full object-cover" />
                </div>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-transparent font-bold text-gray-900 text-xs focus:outline-none cursor-pointer"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cultivation Acreage / Area (Hectares)</label>
              <input
                type="number"
                step="any"
                min="0.1"
                max="10000"
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">1 Hectare ≈ 2.471 Acres</p>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                    Annual Precipitation (mm)
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold">{rainfall} mm</span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="50"
                  max="4000"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Pesticides Usage (Tonnes)
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">{pesticides} T</span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="500"
                  value={pesticides}
                  onChange={(e) => setPesticides(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold">Average Temperature (°C)</span>
                  <span className="font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold">{temp} °C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800 text-white font-bold text-sm shadow-md shadow-amber-700/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Executing Yield Decision Tree...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Forecast Harvest Yield</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                  🤖 {result.source || 'FAO ML Model'}
                </span>
                <span className="text-xs text-gray-500">
                  Target Land Area: <b className="text-gray-900 font-bold">{areaHa} Hectares</b>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Yield (hg/ha)</span>
                  <div className="text-xl font-black text-amber-900 mt-1 font-mono">
                    {result.predicted_yield_hg_per_ha.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-400">Hectograms / Ha</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tonnes / Hectare</span>
                  <div className="text-xl font-black text-emerald-800 mt-1 font-mono">
                    {result.yield_tonnes_per_ha} T/Ha
                  </div>
                  <span className="text-[10px] text-gray-400">Yield Intensity</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Harvest</span>
                  <div className="text-xl font-black text-blue-900 mt-1 font-mono">
                    {result.total_production_tonnes} T
                  </div>
                  <span className="text-[10px] text-gray-400">Total Farm Output</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs text-green-950 leading-relaxed">
                <div className="font-bold text-green-800 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>Yield Benchmark Evaluation</span>
                </div>
                {result.yield_evaluation}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Harvest Yield Forecast Ready</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Select your crop, cultivated hectares, and weather parameters on the left to compute total tonnage predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
