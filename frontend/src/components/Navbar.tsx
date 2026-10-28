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
  Bell,
  LayoutDashboard,
  MapPin,
  Globe,
  Menu,
  X,
  Snowflake,
  Search
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
  const [searchCity, setSearchCity] = useState('');

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), shortLabel: 'Dashboard', icon: LayoutDashboard },
    { path: '/crop-advisor', label: t('cropAdvisor'), shortLabel: 'Crop', icon: Sprout },
    { path: '/fertilizer-advisor', label: t('fertilizerAdvisor'), shortLabel: 'Fertilizer', icon: FlaskConical },
    { path: '/weather', label: t('weather'), shortLabel: 'Weather', icon: Sun },
    { path: '/water-management', label: t('waterManagement'), shortLabel: 'Water', icon: Droplets },
    { path: '/yield-prediction', label: t('yieldPrediction'), shortLabel: 'Yield', icon: Tractor },
    { path: '/market-prices', label: t('marketPrices'), shortLabel: 'Markets', icon: TrendingUp },
    { path: '/frost-risk', label: 'Frost Risk', shortLabel: 'Frost', icon: Snowflake },
    { path: '/ai-assistant', label: t('aiAssistant'), shortLabel: 'AI', icon: Bot },
    { path: '/alerts', label: 'Alerts', shortLabel: 'Alerts', icon: Bell }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-green-100 shadow-sm">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Platform Name */}
          <NavLink to="/" className="flex items-center space-x-2.5 group shrink-0">
            <img
              src="/farmmate-logo.png"
              alt="FarmMate Logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
            />
            <div>
              <span className="text-lg font-extrabold text-green-800 tracking-tight">
                FarmMate
              </span>
              <span className="block text-[10px] font-semibold text-green-600/70 tracking-wider uppercase -mt-0.5">
                Agricultural Intelligence
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                        : 'text-gray-600 hover:text-green-700 hover:bg-green-50/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden 2xl:inline">{item.label}</span>
                  <span className="inline 2xl:hidden">{item.shortLabel}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Location, Search & Language Selectors */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            {/* Location Selector Button */}
            <button
              onClick={() => setShowLocModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-xs text-green-800 transition-colors whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="font-semibold">{location.city}</span>
              <span className="hidden 2xl:inline text-green-600/70">, {location.state}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors shrink-0"
              title="Switch Language (English / Tamil)"
            >
              <Globe className="w-3.5 h-3.5 text-green-600" />
              <span>{language === 'en' ? 'ENG' : 'தமிழ்'}</span>
            </button>

            {/* User avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer">
              K
            </div>
          </div>


          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="px-2 py-1 rounded bg-green-50 border border-green-200 text-xs font-bold text-green-700"
            >
              {language === 'en' ? 'ENG' : 'தமிழ்'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-green-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-green-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="py-2 border-b border-green-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Current Location:</span>
            <button
              onClick={() => { setShowLocModal(true); setMobileMenuOpen(false); }}
              className="flex items-center space-x-1 text-xs text-green-700 font-bold"
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
                      ? 'bg-green-50 text-green-800 font-semibold'
                      : 'text-gray-600 hover:bg-green-50/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-green-600" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-green-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLocModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-green-50">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Select Farm Location</h3>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Select your region to update weather data, frost alerts, and soil context.
            </p>

            {/* Search input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search location..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {CITIES.filter(c => 
                c.city.toLowerCase().includes(searchCity.toLowerCase()) ||
                c.state.toLowerCase().includes(searchCity.toLowerCase())
              ).map((c) => (
                <button
                  key={c.city}
                  onClick={() => {
                    setLocation(c);
                    setShowLocModal(false);
                    setSearchCity('');
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    location.city === c.city
                      ? 'bg-green-50 border-green-400 text-green-800 font-bold shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{c.city}</div>
                  <div className="text-[10px] text-gray-500">{c.state}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
