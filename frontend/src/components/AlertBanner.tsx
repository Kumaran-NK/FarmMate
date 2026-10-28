import React from 'react';
import { CloudRain, Sun, Droplets, AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  type: 'rain' | 'success' | 'irrigation' | 'warning';
  title: string;
  message: string;
}

const ALERT_STYLES = {
  rain: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: CloudRain,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: Sun,
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    textColor: 'text-green-700'
  },
  irrigation: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: Droplets,
    iconColor: 'text-cyan-500',
    titleColor: 'text-cyan-800',
    textColor: 'text-cyan-700'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700'
  }
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, title, message }) => {
  const style = ALERT_STYLES[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4 flex items-start space-x-3`}>
      <div className={`p-2 rounded-lg ${style.bg} ${style.iconColor} shrink-0 mt-0.5`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className={`text-sm font-semibold ${style.titleColor}`}>{title}</h4>
        <p className={`text-xs ${style.textColor} mt-0.5 leading-relaxed`}>{message}</p>
      </div>
    </div>
  );
};
