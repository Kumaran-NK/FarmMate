import React from 'react';
import { AlertTriangle, CloudRain, Snowflake, Droplets, CheckCircle2 } from 'lucide-react';

interface AlertBannerProps {
  type: 'rain' | 'frost' | 'irrigation' | 'info' | 'success';
  title: string;
  message: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, title, message }) => {
  const getStyles = () => {
    switch (type) {
      case 'rain':
        return {
          bg: 'bg-blue-950/40 border-blue-500/40 text-blue-200',
          iconBg: 'bg-blue-500/20 text-blue-400',
          icon: CloudRain
        };
      case 'frost':
        return {
          bg: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
          iconBg: 'bg-rose-500/20 text-rose-400',
          icon: Snowflake
        };
      case 'irrigation':
        return {
          bg: 'bg-teal-950/40 border-teal-500/40 text-teal-200',
          iconBg: 'bg-teal-500/20 text-teal-400',
          icon: Droplets
        };
      case 'success':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          icon: CheckCircle2
        };
      default:
        return {
          bg: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
          iconBg: 'bg-amber-500/20 text-amber-400',
          icon: AlertTriangle
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-xl border ${style.bg} flex items-start space-x-3 backdrop-blur-md shadow-md`}>
      <div className={`p-2 rounded-lg ${style.iconBg} shrink-0 mt-0.5`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-sm tracking-wide">{title}</h4>
        <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
