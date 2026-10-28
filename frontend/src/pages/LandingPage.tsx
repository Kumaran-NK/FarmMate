import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  FlaskConical,
  Droplets,
  TrendingUp,
  Bot,
  ArrowRight,
  Globe2,
  Play,
  X,
  Mic,
  Activity,
  Calendar,
  IndianRupee,
  Gauge,
  ChevronDown
} from 'lucide-react';

import { FeatureDock } from '../components/FeatureDock';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('ENG');

  return (
    <div className="min-h-screen bg-[#f8faf5] text-[#1a2e1a] flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Hero Section Container */}
      <div className="relative w-full overflow-hidden bg-[#e8efe5]">
        {/* Full-width Panoramic SVG Background matching user's replaced SVG asset */}
        <div className="relative w-full min-h-[660px] sm:min-h-[720px] lg:min-h-[780px] xl:min-h-[820px] flex flex-col justify-between overflow-hidden">
          <img
            src="/farmmate_animated_background_v2.svg"
            alt="FarmMate Scenic Sunrise Agricultural Landscape"
            className="absolute inset-0 w-full h-full object-cover object-right lg:object-center pointer-events-none select-none"
          />

          {/* Subtle gradient ensuring pure background clarity while keeping text readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-white/10 to-transparent pointer-events-none" />

          {/* Bottom gradient fade into page background #f8faf5 so seam completely disappears */}
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#f8faf5] via-[#f8faf5]/80 via-30% to-transparent pointer-events-none z-10" />

          {/* Top Navbar */}
          <header className="relative z-20 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <img
                src="/farmmate-logo.png"
                alt="FarmMate Logo"
                className="w-9 h-9 object-contain drop-shadow-sm"
              />
              <span className="text-xl font-bold tracking-tight text-gray-900">FarmMate</span>
            </div>

            {/* Center Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
              <a href="#features" className="hover:text-emerald-800 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">How it works</a>
              <a href="#about" className="hover:text-emerald-800 transition-colors">About</a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <button
                type="button"
                onClick={() => setSelectedLang(selectedLang === 'ENG' ? 'TAM' : 'ENG')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300/80 bg-white/80 backdrop-blur-sm text-xs font-semibold text-gray-700 hover:bg-white transition-all shadow-2xs cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5 text-gray-500" />
                <span>{selectedLang}</span>
                <span className="text-[10px] text-gray-400">▾</span>
              </button>

              {/* Launch App Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/15 cursor-pointer hover:translate-y-[-1px]"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* Hero Headline Content — shifted to the left covering white regions */}
          <div className="relative z-20 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6 sm:pb-8">
            <div className="max-w-xl lg:max-w-2xl">
              <h1 className="font-hero-serif text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.35rem] font-bold text-gray-950 tracking-tight leading-[1.14]">
                Better farm decisions<br />
                start with better<br />
                information.
              </h1>

              <p className="mt-4 text-xs sm:text-sm lg:text-base text-gray-800 font-normal leading-relaxed max-w-lg">
                Analyze soil conditions, understand local weather, plan irrigation, estimate harvests, and explore market trends — all in one platform.
              </p>

              {/* Call To Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 rounded-xl bg-[#064e3b] hover:bg-[#022c22] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all hover:translate-y-[-1px] cursor-pointer"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowDemoModal(true)}
                  className="px-5 py-3 rounded-xl bg-white/95 hover:bg-white text-gray-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm border border-gray-300/80 backdrop-blur-sm transition-all hover:translate-y-[-1px] cursor-pointer"
                >
                  <div className="w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center">
                    <Play className="w-2 h-2 fill-white ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feature Dock — Moved upward to cover blank space */}
          <div className="relative z-20 w-full pb-20 sm:pb-18 lg:pb-20 xl:pb-36">
            <FeatureDock />
          </div>
        </div>
      </div>

      {/* Trust & Architecture Strip */}
      <section className="relative z-20 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 lg:-mt-16 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_12px_36px_rgba(23,75,55,0.08),0_2px_8px_rgba(0,0,0,0.02)] text-center">
          <div>
            <div className="text-xl font-black text-emerald-800">22+ Crops</div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">Agronomic Classifiers</div>
          </div>
          <div>
            <div className="text-xl font-black text-teal-800">FAO-56 Dual</div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">Penman-Monteith ET0</div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-800">7 Mandi States</div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">Stacking Price Ensembles</div>
          </div>
          <div>
            <div className="text-xl font-black text-blue-800">Bilingual AI</div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">English & Tamil Voice</div>
          </div>
        </div>

        {/* Subtle Scroll Cue */}
        <div className="flex justify-center pt-6 pb-2">
          <a
            href="#features"
            className="group flex flex-col items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-900/40 hover:text-emerald-900 transition-colors"
          >
            <span>Scroll to explore modules</span>
            <ChevronDown className="w-4 h-4 text-emerald-700/50 group-hover:text-emerald-700 animate-bounce" />
          </a>
        </div>
      </section>

      {/* Decision Support Feature Modules Section — Overlapping frosted surface revealed on scroll */}
      <section
        id="features"
        className="relative z-10 w-full mt-12 sm:mt-16 lg:mt-20 pt-16 sm:pt-20 lg:pt-24 pb-20 bg-white/80 backdrop-blur-md rounded-t-[2.5rem] sm:rounded-t-[3.5rem] border-t border-emerald-100/90 shadow-[0_-20px_50px_rgba(6,78,59,0.04)]"
      >
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              Precision Agronomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
              Comprehensive Decision Support Modules
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Integrated machine learning models, telemetry sensors, and agronomic knowledge bases tailored for Indian agro-climatic zones.
            </p>
          </div>

          {/* 4 Rich Feature Cards with real data placeholding and interactive tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div
              onClick={() => navigate('/crop-advisor')}
              className="group p-5 rounded-2xl bg-white border border-green-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                    94.8% Match
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                    Crop Recommendation Engine
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Evaluates N-P-K nutrient ppm, soil pH, and precipitation to forecast optimal harvest compatibility.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Test Soil Nutrients</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => navigate('/fertilizer-advisor')}
              className="group p-5 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800 text-[10px] font-bold">
                    Agronomic Guard
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors">
                    Fertilizer Dosage & Safety
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Formulates precise chemical & organic applications (Urea, DAP, MOP) while preventing root scorch.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Formulate Dosage</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => navigate('/water-management')}
              className="group p-5 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100/70 text-sky-800 text-[10px] font-bold">
                    FAO-56 Standard
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-sky-800 transition-colors">
                    ET0 Water Management
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Calculates daily millimeters of water required per square meter based on solar radiation & wind speed.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-bold text-sky-700">
                <span>Plan Irrigation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => navigate('/market-prices')}
              className="group p-5 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800 text-[10px] font-bold">
                    Ensemble AI
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                    Mandi Price Forecasting
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Predicts wholesale vegetable rates (INR/Quintal) across major state markets to optimize harvest sales.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>View Mandi Rates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Connected Stepper */}
      <section id="how-it-works" className="w-full bg-white border-y border-green-100 py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2.5">
              How FarmMate Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              From soil testing to wholesale mandi logistics in four seamless steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 hover:bg-emerald-50/30 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  01
                </span>
                <Gauge className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Input Soil & Weather</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Provide your N-P-K soil sample readings, pH level, and automatic city weather coordinates.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 pt-1">
                ✓ Nitrogen, Phosphorus, Potassium
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 hover:bg-emerald-50/30 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  02
                </span>
                <Activity className="w-4 h-4 text-teal-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Execute ML Models</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pre-trained Random Forest and Stacking algorithms benchmark 20+ crop varieties and fertilizer formulas.
              </p>
              <div className="text-[11px] font-semibold text-teal-700 pt-1">
                ✓ Machine Learning Inference
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 hover:bg-emerald-50/30 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  03
                </span>
                <Calendar className="w-4 h-4 text-sky-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Plan Irrigation & Risks</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Calculate FAO-56 crop water requirements and receive cold wave or frost hazard alarms.
              </p>
              <div className="text-[11px] font-semibold text-sky-700 pt-1">
                ✓ Daily Water Need in mm
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 hover:bg-emerald-50/30 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  04
                </span>
                <IndianRupee className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Harvest & Mandi Dispatch</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Estimate total acreage tonnage and check wholesale mandi selling prices for peak profitability.
              </p>
              <div className="text-[11px] font-semibold text-amber-700 pt-1">
                ✓ Maximize Farm Returns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice AI Interactive Showcase Section */}
      <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-14">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 p-8 sm:p-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Mic className="w-3.5 h-3.5" />
              <span>Voice-First Conversational Assistant</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Ask in English or speak in Tamil
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              FarmMate AI connects directly to real-time farm sensor context and an indexed agricultural RAG vector store for instant, localized agronomic advice.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-900 shadow-2xs">
                🎙️ "How much water does my crop need today?"
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-900 shadow-2xs">
                🎙️ "நாளைக்கு மழை பெய்யுமா?"
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/ai-assistant')}
            className="px-6 py-3.5 rounded-2xl bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Assistant →</span>
          </button>
        </div>
      </section>

      {/* About CTA Section */}
      <section id="about" className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 pb-16">
        <div className="rounded-3xl bg-[#064e3b] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              Empowering Indian Agriculture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to optimize your harvest?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Access machine learning recommendations, simulate FAO-56 irrigation demands, and get proactive weather risk dispatches.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-7 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-[#064e3b] font-bold text-sm shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            Launch FarmMate Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-green-100 py-8 text-xs text-gray-500 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/farmmate-logo.png" alt="FarmMate" className="w-5 h-5 object-contain" />
            <span className="font-bold text-gray-800">FarmMate</span>
            <span>— Agricultural Intelligence Platform</span>
          </div>
          <div>© {new Date().getFullYear()} FarmMate. Smarter farming for a brighter tomorrow.</div>
        </div>
      </footer>

      {/* Watch Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">FarmMate Feature Tour</h3>
                  <p className="text-xs text-gray-500">Agricultural Intelligence System Walkthrough</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center space-y-3 relative overflow-hidden">
              <img
                src="/Agriculture images/Suuny.png"
                alt="Demo Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg">
                <Play className="w-7 h-7 fill-white ml-1 text-white" />
              </div>
              <div className="relative z-10 space-y-1">
                <h4 className="font-bold text-base">Watch Intelligent Agriculture in Action</h4>
                <p className="text-xs text-gray-300 max-w-md">
                  Demonstrating live weather telemetry, soil NPK analysis, crop recommendation classifiers, and bilingual AI assistance.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  navigate('/dashboard');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Open Dashboard Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
