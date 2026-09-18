import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  SunMedium,
  Droplets,
  FlaskConical,
  TrendingUp,
  LineChart,
  Snowflake,
  Bot,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Sparkles
} from 'lucide-react';
import { FarmScene } from '../components/FarmScene';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sprout className="w-6 h-6 text-emerald-400" />,
      title: 'Crop Advisor',
      desc: 'Machine learning recommendations based on NPK, pH, temperature, humidity & rainfall.',
      route: '/crop-advisor'
    },
    {
      icon: <SunMedium className="w-6 h-6 text-amber-400" />,
      title: 'Weather Intelligence',
      desc: 'Real-time forecasts, rain probability, evapotranspiration & agricultural weather advisories.',
      route: '/weather'
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-teal-400" />,
      title: 'Fertilizer Advisor',
      desc: 'Precision N-P-K nutrient dosage matching soil deficiencies to crop requirement.',
      route: '/fertilizer'
    },
    {
      icon: <Droplets className="w-6 h-6 text-cyan-400" />,
      title: 'Water Management',
      desc: 'Daily ET0 water balance calculations and tailored irrigation scheduling.',
      route: '/water-management'
    },
    {
      icon: <LineChart className="w-6 h-6 text-indigo-400" />,
      title: 'Yield Prediction',
      desc: 'Forecast expected harvest tons per hectare using crop, area & weather history.',
      route: '/yield-prediction'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      title: 'Market Intelligence',
      desc: 'Live Mandi price trends and harvest timing optimization for maximum profit.',
      route: '/market-prices'
    },
    {
      icon: <Snowflake className="w-6 h-6 text-sky-400" />,
      title: 'Frost Risk Assessment',
      desc: 'Early warning alert system for frost events safeguarding tender crops.',
      route: '/frost-risk'
    },
    {
      icon: <Bot className="w-6 h-6 text-emerald-300" />,
      title: 'FarmMate AI Assistant',
      desc: 'Conversational assistant answering agricultural questions in English & Tamil.',
      route: '/ai-assistant'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Top Floating Branding Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-30">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-1.5">
              <span>FarmMate</span>
              <span className="text-emerald-400">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Agricultural Intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/ai-assistant')}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-300 hover:text-emerald-300 transition-all"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 transition-all"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 space-y-16 pb-20">
        
        <div className="relative rounded-3xl border border-slate-800 overflow-hidden shadow-2xl min-h-[460px] flex items-center justify-center p-8 sm:p-12">
          {/* Animated 2D Agricultural Background */}
          <FarmScene weatherState="sunny" />

          {/* Hero Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10" />

          {/* Hero Content */}
          <div className="relative z-20 max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smarter Farming. Better Yields. Data-Driven Decisions.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Empowering Modern Farmers with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Precision Agricultural AI
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              FarmMate integrates machine learning crop advisor, real-time micro-climate weather analysis, precision NPK soil fertilizer tuning, and daily ET0 irrigation scheduling into one intuitive platform.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-sm font-extrabold text-white shadow-xl shadow-emerald-950/80 transition-all hover:scale-[1.02]"
              >
                <Sprout className="w-5 h-5" />
                <span>Explore FarmMate Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/ai-assistant')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 text-sm font-semibold text-slate-200 hover:text-white transition-all backdrop-blur-md"
              >
                <Bot className="w-5 h-5 text-emerald-400" />
                <span>Ask FarmMate AI (English / தமிழ்)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Comprehensive Decision Support Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed for agronomists, farmers, and agricultural extension services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(feat.route)}
                className="group relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 w-fit group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 flex items-center text-xs font-semibold text-emerald-400 space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Verified Ag-ML Models</h4>
              <p className="text-[11px] text-slate-400">Random Forest, XGBoost & ET0 Physics</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3">
            <Globe2 className="w-8 h-8 text-teal-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Multilingual Interface</h4>
              <p className="text-[11px] text-slate-400">Full English and Tamil Support</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3">
            <SunMedium className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Live OpenWeather Sync</h4>
              <p className="text-[11px] text-slate-400">Micro-climate humidity, temp & rain</p>
            </div>
          </div>
        </div>

      </main>

      {/* Landing Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 FarmMate AI. Empowering sustainable agricultural ecosystems.</p>
      </footer>

    </div>
  );
};
