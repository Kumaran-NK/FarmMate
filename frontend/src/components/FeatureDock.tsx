import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  FlaskConical,
  SunMedium,
  Droplets,
  BarChart3,
  TrendingUp,
  Snowflake,
  Bot
} from 'lucide-react';

const FEATURES = [
  { to: '/crop-advisor',       title: 'Crop',       sub: 'Recommendation', icon: Sprout },
  { to: '/fertilizer-advisor', title: 'Fertilizer', sub: 'Advisory',       icon: FlaskConical },
  { to: '/weather',            title: 'Weather',    sub: 'Intelligence',   icon: SunMedium },
  { to: '/water-management',   title: 'Water',      sub: 'Management',     icon: Droplets },
  { to: '/yield-prediction',   title: 'Yield',      sub: 'Prediction',     icon: BarChart3 },
  { to: '/market-prices',      title: 'Market',     sub: 'Forecast',       icon: TrendingUp },
  { to: '/frost-risk',         title: 'Frost',      sub: 'Risk Alerts',    icon: Snowflake },
  { to: '/ai-assistant',       title: 'AI',         sub: 'Assistant',      icon: Bot },
];

export const FeatureDock: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Platform features"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl
                   bg-white/75 backdrop-blur-xl border border-white/85
                   shadow-[0_16px_40px_rgba(23,75,55,0.14),0_4px_16px_rgba(0,0,0,0.04)]"
      >
        {FEATURES.map(({ to, title, sub, icon: Icon }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all duration-200
                       hover:bg-white/85 cursor-pointer text-left
                       lg:border-l lg:border-emerald-950/10 lg:first:border-l-0"
          >
            <span className="grid place-items-center w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-emerald-600/15 text-emerald-800 group-hover:scale-105 group-hover:bg-emerald-600/20 transition-all duration-200 shadow-2xs">
              <Icon className="w-5 h-5" />
            </span>
            <span className="leading-tight min-w-0">
              <span className="block text-sm sm:text-[14.5px] font-bold text-emerald-950 truncate group-hover:text-emerald-900">
                {title}
              </span>
              <span className="block text-[11px] sm:text-[11.5px] font-medium text-emerald-900/70 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                {sub}
              </span>
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
