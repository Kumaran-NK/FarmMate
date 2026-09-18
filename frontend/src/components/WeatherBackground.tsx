import React from 'react';
import { FarmScene } from './FarmScene';
import { useFarmContext } from '../context/FarmContext';

interface WeatherBackgroundProps {
  children?: React.ReactNode;
  heightClass?: string;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  children,
  heightClass = 'min-h-[280px]',
}) => {
  const { weatherCondition } = useFarmContext();

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-800 shadow-2xl ${heightClass} transition-all duration-700`}>
      {/* 2D Animated Farm Scene */}
      <FarmScene weatherState={weatherCondition} />

      {/* Subtle Fog / Frost Ambient Overlay */}
      {weatherCondition === 'fog' && (
        <div className="absolute inset-0 bg-slate-400/15 backdrop-blur-[2px] pointer-events-none" />
      )}
      {weatherCondition === 'frost' && (
        <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
      )}

      {/* Content Container layered above the animation */}
      <div className="relative z-20 h-full p-6 sm:p-8 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
