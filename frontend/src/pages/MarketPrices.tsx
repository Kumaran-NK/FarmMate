import React, { useState } from 'react';
import { TrendingUp, Truck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { MarketPrediction } from '../types';

const VEGETABLES = ['Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Spinach', 'Cauliflower', 'Brinjal'];
const STATES = ['Tamil Nadu', 'Maharashtra', 'Karnataka', 'Punjab', 'Uttar Pradesh', 'West Bengal', 'Gujarat'];
const MARKETS = ['Chennai', 'Mumbai', 'Bengaluru', 'Amritsar', 'Lucknow', 'Kolkata', 'Ahmedabad'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const MarketPricesPage: React.FC = () => {
  const [vegetable, setVegetable] = useState<string>('Tomato');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [market, setMarket] = useState<string>('Chennai');
  const [month, setMonth] = useState<string>('October');
  const [temp, setTemp] = useState<number>(25.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MarketPrediction | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      vegetable,
      state,
      market,
      month,
      temp
    };

    try {
      const res = await api.predictMarketPrice(payload);
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Stacking Ensemble AI (XGBoost + LightGBM + CatBoost)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Vegetable Market Price & Demand Forecaster</h1>
        <p className="text-xs text-slate-400 mt-1">
          Forecast wholesale mandi market prices (INR per Quintal & per Kg) and supply chain logistics recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <form onSubmit={handlePredict} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vegetable Commodity</label>
              <select
                value={vegetable}
                onChange={(e) => setVegetable(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {VEGETABLES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Market / Mandi</label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {MARKETS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Month of Sale</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Average Temperature (°C)</span>
                <span className="font-mono text-purple-400 font-bold">{temp} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Evaluating Stacking Model...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Forecast Market Price</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Output Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-2xl backdrop-blur-md space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                  🤖 {result.source}
                </span>
                <span className="text-xs text-slate-400">
                  {result.vegetable} in <b className="text-white">{result.month}</b>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Price / Quintal</span>
                  <div className="text-xl font-black text-purple-400 mt-1 font-mono">
                    ₹ {result.predicted_price_rs_per_quintal.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Price / Kg</span>
                  <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                    ₹ {result.predicted_price_per_kg}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Demand Status</span>
                  <div className="text-sm font-extrabold text-cyan-300 mt-2">
                    {result.demand_status}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-200 leading-relaxed space-y-2">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-400" />
                  <span>Selling & Logistics Advisory</span>
                </div>
                <p>{result.advisory}</p>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Market Price Forecasting Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your vegetable commodity and target mandi market on the left to view predicted market prices.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
