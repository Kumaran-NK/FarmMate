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
  Snowflake,
  ChevronDown,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  User
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

interface NavSection {
  title: string;
  items: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: '',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Cultivation',
    items: [
      { path: '/crop-advisor', label: 'Crop Advisor', icon: Sprout },
      { path: '/fertilizer-advisor', label: 'Fertilizer Advisor', icon: FlaskConical },
      { path: '/yield-prediction', label: 'Yield Prediction', icon: Tractor },
    ]
  },
  {
    title: 'Conditions & Resources',
    items: [
      { path: '/weather', label: 'Weather', icon: Sun },
      { path: '/water-management', label: 'Water Management', icon: Droplets },
      { path: '/frost-risk', label: 'Frost Risk', icon: Snowflake },
    ]
  },
  {
    title: 'Markets',
    items: [
      { path: '/market-prices', label: 'Market Prices', icon: TrendingUp },
    ]
  },
  {
    title: 'Assistance',
    items: [
      { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
      { path: '/alerts', label: 'Alerts', icon: Bell },
    ]
  },
];

export const Sidebar: React.FC = () => {
  const { location, setLocation } = useFarmContext();
  const [collapsed, setCollapsed] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
        style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.03)' }}
      >
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-100 shrink-0 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/farmmate-logo.png"
              alt="FarmMate Logo"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            {!collapsed && (
              <span className="text-[17px] font-extrabold text-green-800 tracking-tight whitespace-nowrap">
                FarmMate
              </span>
            )}
          </NavLink>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-2 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 scrollbar-thin">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className={sIdx > 0 ? 'mt-4' : ''}>
              {/* Section title */}
              {section.title && !collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.08em]">
                  {section.title}
                </div>
              )}
              {section.title && collapsed && (
                <div className="mx-auto w-5 h-px bg-gray-200 my-2" />
              )}

              {/* Section items */}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }: { isActive: boolean }) =>
                      `group flex items-center gap-2.5 rounded-xl transition-all duration-200 ${
                        collapsed ? 'justify-center p-2.5 mx-auto' : 'px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-green-600 text-white shadow-md shadow-green-200'
                          : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && (
                      <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section: Location */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          {!collapsed ? (
            <button
              onClick={() => setShowLocModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-50/80 hover:bg-green-100 border border-green-200/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-green-700" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-green-900 truncate">{location.city}</div>
                <div className="text-[10px] text-green-600/80 truncate">{location.state}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-green-600 ml-auto shrink-0 group-hover:translate-y-0.5 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => setShowLocModal(true)}
              className="w-full flex justify-center p-2 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200/60 transition-colors"
              title={`${location.city}, ${location.state}`}
            >
              <MapPin className="w-4 h-4 text-green-700" />
            </button>
          )}
        </div>
      </aside>

      {/* Location Picker Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-green-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in-up">
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
    </>
  );
};

/* ── Top Bar (sits to the right of the sidebar) ── */
export const TopBar: React.FC = () => {
  const { location, language, setLanguage } = useFarmContext();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-6 gap-4">
      {/* Left: Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search location..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200 transition-all"
          readOnly
        />
      </div>

      {/* Right: Location badge, language, bell, avatar */}
      <div className="flex items-center gap-3">
        {/* Location */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-green-600" />
          <span className="font-semibold">{location.city}</span>
          <span className="text-gray-400">{location.state}</span>
        </div>

        {/* Language */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-600 transition-colors"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-green-600" />
          <span>{language === 'en' ? 'EN' : 'தமி'}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer ring-2 ring-green-100">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
