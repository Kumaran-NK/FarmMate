import React, { useState } from 'react';
import { Snowflake, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { FrostRiskResponse } from '../types';

const INDIAN_CITIES = [
  'Shimla', 'Leh', 'Srinagar', 'Manali', 'Dehradun', 'Shillong', 'Gangtok',
  'Dalhousie', 'Nainital', 'Mussoorie', 'Darjeeling', 'Ooty', 'Kodaikanal',
  'Munnar', 'Coonoor', 'Amritsar', 'Chandigarh', 'Jaipur', 'Delhi', 'Lucknow'
];

export const FrostRiskPage: React.FC = () => {
  const [city, setCity] = useState<string>('Shimla');
  const [temp, setTemp] = useState<number>(2.0);
  const [humidity, setHumidity] = useState<number>(85.0);
  const [windSpeed, setWindSpeed] = useState<number>(1.5);
  const [cloudCover, setCloudCover] = useState<number>(10.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FrostRiskResponse | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      city,
      temperature: temp,
      humidity,
      wind_speed: windSpeed,
      cloud_cover: cloudCover
    };

    try {
      const res = await api.predictFrost(payload);
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold mb-2">
          <Snowflake className="w-3.5 h-3.5" />
          <span>Cold Wave & Frost Hazard Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Indian Agricultural Frost Risk Alarm</h1>
        <p className="text-xs text-slate-400 mt-1">
          Predict localized frost hazards for cold-sensitive Indian crops using a trained XGBoost classification model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <form onSubmit={handleEvaluate} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Region / City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Ambient Temperature (°C)</span>
                  <span className="font-mono text-rose-400 font-bold">{temp} °C</span>
                </div>
                <input
                  type="range"
                  min="-5.0"
                  max="30.0"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Relative Humidity (%)</span>
                  <span className="font-mono text-cyan-400 font-bold">{humidity} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Wind Speed (m/s)</span>
                  <span className="font-mono text-purple-400 font-bold">{windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="20.0"
                  step="0.5"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Cloud Cover (%)</span>
                  <span className="font-mono text-slate-300 font-bold">{cloudCover} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={cloudCover}
                  onChange={(e) => setCloudCover(Number(e.target.value))}
                  className="w-full accent-slate-400 bg-slate-800 h-2 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Evaluating XGBoost Frost Model...</span>
              ) : (
                <>
                  <Snowflake className="w-4 h-4" />
                  <span>Evaluate Frost Risk</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-rose-500/40 shadow-2xl backdrop-blur-md space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                  🤖 Trained XGBoost Model
                </span>
                <span className="text-xs text-slate-400">
                  Calculated Dew Point: <b className="text-cyan-400">{result.dew_point} °C</b>
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Evaluated Risk Level</span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {result.risk_level}
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                  Model Frost Probability: <b className="text-rose-400 font-mono">{(result.frost_probability * 100).toFixed(1)}%</b>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200 leading-relaxed">
                <div className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Precautionary Advisory & Actions</span>
                </div>
                {result.recommended_action || result.advisory}
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                <Snowflake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Frost Evaluation Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your city and ambient telemetry on the left, then click <b>Evaluate Frost Risk</b>.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
