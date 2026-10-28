import React, { useState } from 'react';
import { TrendingUp, Truck, Sparkles, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { api } from '../services/api';
import type { MarketPrediction } from '../types';
import { SmartImage } from '../components/SmartImage';
import { getCropImage } from '../services/imageMap';

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

  const vegImg = getCropImage(vegetable);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mandi Stacking Ensemble (XGBoost + LightGBM + CatBoost)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Market Prices & Demand</h1>
          <p className="text-sm text-gray-500 mt-1">
            Forecast wholesale mandi commodity pricing (INR / Quintal & Kg) and optimize dispatch timing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-green-100 rounded-2xl p-6 shadow-sm space-y-4">
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vegetable Commodity</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <SmartImage src={vegImg} alt={vegetable} fallbackType="crop" className="w-full h-full object-cover" />
                </div>
                <select
                  value={vegetable}
                  onChange={(e) => setVegetable(e.target.value)}
                  className="w-full bg-transparent font-bold text-gray-900 text-xs focus:outline-none cursor-pointer"
                >
                  {VEGETABLES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State / Province</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Mandi / Market</label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {MARKETS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Month of Harvest / Sale
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-700 font-semibold">Average Temperature (°C)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{temp} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Running Stacking Price Models...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Forecast Mandi Price</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                  🤖 {result.source || 'Ensemble Forecaster'}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {result.vegetable} in <b>{result.month}</b>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price / Quintal</span>
                  <div className="text-xl font-black text-emerald-800 mt-1 font-mono flex items-center justify-center gap-0.5">
                    <IndianRupee className="w-4 h-4 text-emerald-700" />
                    {result.predicted_price_rs_per_quintal.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-400">100 Kilograms</span>
                </div>

                <div className="p-4 rounded-xl bg-green-50/60 border border-green-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wholesale Price / Kg</span>
                  <div className="text-xl font-black text-green-800 mt-1 font-mono flex items-center justify-center gap-0.5">
                    <IndianRupee className="w-4 h-4 text-green-700" />
                    {result.predicted_price_per_kg}
                  </div>
                  <span className="text-[10px] text-gray-400">Farm Gate Index</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Demand Status</span>
                  <div className="text-base font-extrabold text-blue-900 mt-1">
                    {result.demand_status}
                  </div>
                  <span className="text-[10px] text-gray-400">Mandi Liquidity</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-gray-800 leading-relaxed space-y-1.5">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Selling & Logistics Advisory</span>
                </div>
                <p>{result.advisory}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Market Price Forecasting Ready</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Select your vegetable commodity and target mandi market on the left to calculate projected market prices.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
