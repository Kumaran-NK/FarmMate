import React from 'react';
import { useFarmContext } from '../context/FarmContext';

// Map weather conditions to agriculture images
const WEATHER_IMAGES: Record<string, string> = {
  sunny: '/Agriculture images/Suuny.png',
  cloudy: '/Agriculture images/Cloudy.png',
  rain: '/Agriculture images/Rainy.png',
  storm: '/Agriculture images/thunderstorm.png',
  fog: '/Agriculture images/Cloudy.png',
  frost: '/Agriculture images/Late Night.png',
};

interface WeatherBackgroundProps {
  children?: React.ReactNode;
  heightClass?: string;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  children,
  heightClass = 'min-h-[280px]',
}) => {
  const { weatherCondition } = useFarmContext();
  const bgImage = WEATHER_IMAGES[weatherCondition] || WEATHER_IMAGES.sunny;

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg ${heightClass} transition-all duration-700`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url("${bgImage}")` }}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Content Container layered above the background */}
      <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
