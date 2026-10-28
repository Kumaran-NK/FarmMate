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
  const { location, setLocation, darkMode } = useFarmContext();
  const [collapsed, setCollapsed] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  const dm = darkMode;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        } ${dm ? 'bg-gray-900 border-gray-700/80' : 'bg-white border-gray-200/80'}`}
        style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}
      >
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b shrink-0 ${dm ? 'border-gray-700/60' : 'border-gray-100'} ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/farmmate-logo.png"
              alt="FarmMate Logo"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            {!collapsed && (
              <span className={`text-[17px] font-extrabold tracking-tight whitespace-nowrap ${dm ? 'text-green-400' : 'text-green-800'}`}>
                FarmMate
              </span>
            )}
          </NavLink>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className={`ml-auto p-1 rounded-md transition-colors ${dm ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
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
            className={`mx-auto mt-2 p-1.5 rounded-md transition-colors ${dm ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
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
                <div className={`px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  {section.title}
                </div>
              )}
              {section.title && collapsed && (
                <div className={`mx-auto w-5 h-px my-2 ${dm ? 'bg-gray-700' : 'bg-gray-200'}`} />
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
                          ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                          : dm
                            ? 'text-gray-400 hover:bg-green-900/40 hover:text-green-300'
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
        <div className={`shrink-0 border-t p-3 ${dm ? 'border-gray-700/60' : 'border-gray-100'}`}>
          {!collapsed ? (
            <button
              onClick={() => setShowLocModal(true)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors group ${
                dm
                  ? 'bg-green-900/30 hover:bg-green-900/50 border-green-700/40'
                  : 'bg-green-50/80 hover:bg-green-100 border-green-200/60'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dm ? 'bg-green-800/60' : 'bg-green-100'}`}>
                <MapPin className={`w-4 h-4 ${dm ? 'text-green-400' : 'text-green-700'}`} />
              </div>
              <div className="text-left min-w-0">
                <div className={`text-xs font-bold truncate ${dm ? 'text-green-300' : 'text-green-900'}`}>{location.city}</div>
                <div className={`text-[10px] truncate ${dm ? 'text-green-500/80' : 'text-green-600/80'}`}>{location.state}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 ml-auto shrink-0 group-hover:translate-y-0.5 transition-transform ${dm ? 'text-green-500' : 'text-green-600'}`} />
            </button>
          ) : (
            <button
              onClick={() => setShowLocModal(true)}
              className={`w-full flex justify-center p-2 rounded-xl border transition-colors ${
                dm ? 'bg-green-900/30 hover:bg-green-900/50 border-green-700/40' : 'bg-green-50 hover:bg-green-100 border-green-200/60'
              }`}
              title={`${location.city}, ${location.state}`}
            >
              <MapPin className={`w-4 h-4 ${dm ? 'text-green-400' : 'text-green-700'}`} />
            </button>
          )}
        </div>
      </aside>

      {/* Location Picker Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in-up ${
            dm ? 'bg-gray-900 border-gray-700' : 'bg-white border-green-100'
          }`}>
            <button
              onClick={() => setShowLocModal(false)}
              className={`absolute top-4 right-4 ${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 mb-4">
              <div className={`p-2 rounded-lg ${dm ? 'bg-green-900/50' : 'bg-green-50'}`}>
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <h3 className={`text-lg font-bold ${dm ? 'text-gray-100' : 'text-gray-900'}`}>Select Farm Location</h3>
            </div>

            <p className={`text-xs mb-4 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
              Select your region to update weather data, frost alerts, and soil context.
            </p>

            {/* Search input */}
            <div className="relative mb-3">
              <Search className={`w-4 h-4 absolute left-3 top-2.5 ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search location..."
                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-green-400 ${
                  dm ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-200'
                }`}
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
                      ? 'bg-green-600 border-green-500 text-white font-bold shadow-sm'
                      : dm
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-500 hover:bg-green-900/30'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="font-semibold">{c.city}</div>
                  <div className={`text-[10px] ${location.city === c.city ? 'text-green-100' : dm ? 'text-gray-500' : 'text-gray-500'}`}>{c.state}</div>
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
  const { location, language, setLanguage, darkMode, setDarkMode } = useFarmContext();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [readNotifs, setReadNotifs] = useState<number[]>([]);

  const notifications = [
    { id: 1, icon: '🌧️', title: 'Rain Alert', msg: `Heavy rain likely in ${location.city} tomorrow.`, time: '2m ago', color: 'bg-blue-50 border-blue-200' },
    { id: 2, icon: '🌡️', title: 'Heat Advisory', msg: 'Temperature above 38°C — irrigate morning/evening.', time: '1h ago', color: 'bg-orange-50 border-orange-200' },
    { id: 3, icon: '🌱', title: 'Crop Recommendation', msg: 'Optimal conditions for Sorghum planting this week.', time: '3h ago', color: 'bg-green-50 border-green-200' },
    { id: 4, icon: '💰', title: 'Market Price Update', msg: 'Tomato prices up 12% in nearby mandis.', time: '5h ago', color: 'bg-yellow-50 border-yellow-200' },
    { id: 5, icon: '❄️', title: 'Frost Warning', msg: 'Frost risk low for the next 7 days.', time: '1d ago', color: 'bg-cyan-50 border-cyan-200' },
  ];

  const unreadCount = notifications.filter(n => !readNotifs.includes(n.id)).length;

  return (
    <header className={`sticky top-0 z-30 h-16 backdrop-blur-lg border-b flex items-center justify-between px-6 gap-4 transition-colors ${
      darkMode
        ? 'bg-gray-900/90 border-gray-700/50 text-gray-100'
        : 'bg-white/80 border-gray-100 text-gray-800'
    }`}>
      {/* Left: Search */}
      <div className="relative flex-1 max-w-md">
        <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Search crops, locations, features..."
          className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/30'
              : 'bg-gray-50 border-gray-200 focus:border-green-400 focus:ring-green-200'
          }`}
          readOnly
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Location badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
          darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
          <MapPin className="w-3.5 h-3.5 text-green-500" />
          <span className="font-semibold">{location.city}</span>
          <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>{location.state}</span>
        </div>

        {/* Language */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
          }`}
          title="Switch Language (English / Tamil)"
        >
          <Globe className="w-3.5 h-3.5 text-green-500" />
          <span>{language === 'en' ? 'EN' : 'தமி'}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            darkMode
              ? 'bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/30 text-yellow-300'
              : 'bg-gray-800/5 hover:bg-gray-800/10 border-gray-300 text-gray-600'
          }`}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1zm0 14a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm9-7a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2h1zM4 12a1 1 0 0 1-1 1H2a1 1 0 0 1 0-2h1a1 1 0 0 1 1 1zm13.657-5.657a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM7.05 16.95a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707A1 1 0 0 1 7.05 16.95zm11.314 1.414a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 0 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414zM7.05 7.05A1 1 0 0 1 5.636 7.05l-.707-.707A1 1 0 0 1 6.343 4.93l.707.707A1 1 0 0 1 7.05 7.05zM12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75 9.75 9.75 0 0 1 8.252 6a9.718 9.718 0 0 1 .75-3.752A9.751 9.751 0 0 0 12 21.75a9.751 9.751 0 0 0 9.752-6.748z"/></svg>
          )}
          <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="notif-btn"
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className={`relative p-2 rounded-full border transition-all ${
              showNotif
                ? darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'
                : darkMode ? 'hover:bg-gray-800 border-transparent' : 'hover:bg-gray-100 border-transparent'
            }`}
            title="Notifications"
          >
            <Bell className={`w-4.5 h-4.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotif && (
            <div className={`absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Notifications</h3>
                  <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unreadCount} unread alerts</p>
                </div>
                <button
                  onClick={() => setReadNotifs(notifications.map(n => n.id))}
                  className="text-[10px] font-semibold text-green-600 hover:text-green-700"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setReadNotifs(p => [...p, n.id])}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      readNotifs.includes(n.id)
                        ? darkMode ? 'opacity-50' : 'opacity-60'
                        : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{n.title}</span>
                        <span className={`text-[10px] shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{n.time}</span>
                      </div>
                      <p className={`text-[11px] leading-snug mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{n.msg}</p>
                    </div>
                    {!readNotifs.includes(n.id) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
              <div className={`px-4 py-2.5 border-t text-center ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <button className="text-xs text-green-600 hover:text-green-700 font-semibold">View all alerts →</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            id="profile-btn"
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className={`w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center shadow-md ring-2 transition-all ${
              showProfile ? 'ring-green-400 scale-105' : 'ring-green-100 hover:ring-green-300'
            }`}
            title="Profile"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className={`absolute right-0 top-12 w-64 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/40">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Kumaran N</div>
                    <div className="text-green-100 text-[11px]">kumaran@farmmate.in</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                      <span className="text-green-200 text-[10px]">Pro Farmer Account</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className={`py-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {[
                  { icon: '👤', label: 'My Profile', sub: 'View & edit your info' },
                  { icon: '🏠', label: 'Farm Settings', sub: 'Soil type, crop calendar' },
                  { icon: '🔔', label: 'Alert Preferences', sub: 'Customize notifications' },
                  { icon: '🌐', label: 'Language & Region', sub: `Currently: ${language === 'en' ? 'English' : 'Tamil'}` },
                ].map(item => (
                  <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.sub}</div>
                    </div>
                  </button>
                ))}

                {/* Dark mode toggle inside profile */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{darkMode ? '☀️' : '🌙'}</span>
                    <div>
                      <div className="text-xs font-semibold">{darkMode ? 'Light Mode' : 'Dark Mode'}</div>
                      <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Toggle appearance</div>
                    </div>
                  </div>
                  {/* Toggle pill */}
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${darkMode ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>

              {/* Sign out */}
              <div className={`border-t px-4 py-2.5 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <button className="w-full flex items-center gap-2 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside overlay to close dropdowns */}
      {(showNotif || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowProfile(false); }} />
      )}
    </header>
  );
};
