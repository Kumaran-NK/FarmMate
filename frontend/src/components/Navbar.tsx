import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sprout,
  FlaskConical,
  Sun,
  Droplets,
  Tractor,
  TrendingUp,
  Bot,
  LayoutDashboard,
  MapPin,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { useFarmContext } from '../context/FarmContext';

const CITIES = [
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { city: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
  { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 }
];

export const Navbar: React.FC = () => {
  const { location, setLocation, language, setLanguage, t } = useFarmContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);

  const navItems = [
    { path: '/', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/crop-advisor', label: t('cropAdvisor'), icon: Sprout },
    { path: '/fertilizer-advisor', label: t('fertilizerAdvisor'), icon: FlaskConical },
    { path: '/weather', label: t('weather'), icon: Sun },
    { path: '/water-management', label: t('waterManagement'), icon: Droplets },
    { path: '/yield-prediction', label: t('yieldPrediction'), icon: Tractor },
    { path: '/market-prices', label: t('marketPrices'), icon: TrendingUp },
    { path: '/ai-assistant', label: t('aiAssistant'), icon: Bot }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                FarmMate
              </span>
              <span className="block text-[10px] font-semibold text-emerald-400/80 tracking-wider uppercase">
                Agronomic Intelligence
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Location & Language Selectors */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Location Selector Button */}
            <button
              onClick={() => setShowLocModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{location.city}, {location.state}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-emerald-300 transition-colors"
              title="Switch Language (English / Tamil)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'ENG' : 'தமிழ்'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400"
            >
              {language === 'en' ? 'ENG' : 'தமிழ்'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="py-2 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">Current Location:</span>
            <button
              onClick={() => { setShowLocModal(true); setMobileMenuOpen(false); }}
              className="flex items-center space-x-1 text-xs text-emerald-400 font-bold"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{location.city}, {location.state}</span>
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-emerald-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLocModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Select Farm Location</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select your region to update weather telemetry, frost alarms, and regional soil context.
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {CITIES.map((c) => (
                <button
                  key={c.city}
                  onClick={() => {
                    setLocation(c);
                    setShowLocModal(false);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    location.city === c.city
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold text-white">{c.city}</div>
                  <div className="text-[10px] text-slate-400">{c.state}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
