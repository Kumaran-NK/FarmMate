import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'rose' | 'purple' | 'cyan';
  badge?: string;
}

const COLOR_MAPS = {
  emerald: {
    bg: 'from-emerald-950/40 to-slate-900',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  amber: {
    bg: 'from-amber-950/40 to-slate-900',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15 text-amber-400',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  blue: {
    bg: 'from-blue-950/40 to-slate-900',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/15 text-blue-400',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  rose: {
    bg: 'from-rose-950/40 to-slate-900',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/15 text-rose-400',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  purple: {
    bg: 'from-purple-950/40 to-slate-900',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/15 text-purple-400',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  cyan: {
    bg: 'from-cyan-950/40 to-slate-900',
    border: 'border-cyan-500/30',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  badge
}) => {
  const styles = COLOR_MAPS[color];

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-b ${styles.bg} border ${styles.border} shadow-lg backdrop-blur-md relative overflow-hidden group hover:translate-y-[-2px] transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
          <div className={`text-2xl font-black mt-1 ${styles.text}`}>{value}</div>
          {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
        </div>
        <div className={`p-3 rounded-xl ${styles.iconBg} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3">
          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${styles.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
