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
    iconBg: 'bg-green-50 text-green-600',
    text: 'text-green-700',
    badge: 'bg-green-50 text-green-600 border-green-200'
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    text: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600',
    text: 'text-blue-700',
    badge: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600',
    text: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-600 border-rose-200'
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600',
    text: 'text-purple-700',
    badge: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  cyan: {
    iconBg: 'bg-cyan-50 text-cyan-600',
    text: 'text-cyan-700',
    badge: 'bg-cyan-50 text-cyan-600 border-cyan-200'
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
    <div className="farm-card p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500 tracking-wide">{title}</span>
          <div className={`text-2xl font-extrabold mt-1 ${styles.text}`}>{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
        <div className={`p-2.5 rounded-xl ${styles.iconBg} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3">
          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${styles.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
