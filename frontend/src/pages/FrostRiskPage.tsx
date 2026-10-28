import React, { useState } from 'react';
import { Snowflake, ShieldCheck, Thermometer, Wind, Cloud, Droplets, AlertTriangle } from 'lucide-react';
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

  const getRiskColor = (level?: string) => {
    const l = (level || '').toLowerCase();
    if (l.includes('high') || l.includes('severe')) return 'bg-red-50 text-red-700 border-red-200';
    if (l.includes('medium') || l.includes('moderate')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Snowflake className="w-3.5 h-3.5" />
            <span>Thermal Inversion & Cold Wave Alarm</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Frost Risk Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Detect freeze injury conditions for cold-sensitive crops using localized XGBoost dew point modeling.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-green-100 rounded-2xl p-6 shadow-sm space-y-4">
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Agricultural Region / City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-4">
              <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                    Ambient Temperature (°C)
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{temp} °C</span>
                </div>
                <input
                  type="range"
                  min="-5.0"
                  max="30.0"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="bg-cyan-50/40 p-3 rounded-xl border border-cyan-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                    Relative Humidity (%)
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">{humidity} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-gray-500" />
                    Wind Velocity (m/s)
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold">{windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="20.0"
                  step="0.5"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-1">Calm winds (&lt;2 m/s) significantly elevate radiation frost risk.</p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-semibold flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-gray-500" />
                    Cloud Cover (%)
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold">{cloudCover} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={cloudCover}
                  onChange={(e) => setCloudCover(Number(e.target.value))}
                  className="w-full accent-gray-600 cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-1">Clear night skies cause rapid terrestrial heat loss.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Running XGBoost Frost Inversion Model...</span>
              ) : (
                <>
                  <Snowflake className="w-4 h-4" />
                  <span>Evaluate Frost Hazard</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
                  🤖 XGBoost Frost Classifier
                </span>
                <span className="text-xs text-gray-500">
                  Calculated Dew Point: <b className="text-blue-900 font-bold">{result.dew_point} °C</b>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Evaluated Hazard Status</span>
                  <div className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg border text-sm font-bold ${getRiskColor(result.risk_level)}`}>
                      {result.risk_level}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-gray-500">Frost Probability</div>
                  <div className="text-2xl font-black text-blue-900 font-mono">
                    {(result.frost_probability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-gray-800 leading-relaxed space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Precautionary Advisory & Horticultural Actions</span>
                </div>
                <p>{result.recommended_action || result.advisory}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Cold wave conditions impact sensitive horticultural crops (e.g., tomatoes, papaya, tea flush). Deploy micro-sprinklers or mulching covers before midnight if risk is Moderate or High.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Snowflake className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Frost Evaluation Ready</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Select your region and enter local nocturnal temperature and humidity values to compute freeze probability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
