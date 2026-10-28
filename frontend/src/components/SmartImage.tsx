import React, { useState } from 'react';
import { Sprout, Leaf, FlaskConical, SunMedium, TrendingUp } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackType?: 'crop' | 'fertilizer' | 'weather' | 'market' | 'generic';
  className?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fallbackType = 'crop',
  className = '',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(!src);

  const getFallbackIcon = () => {
    switch (fallbackType) {
      case 'crop':
        return <Sprout className="w-8 h-8 text-emerald-600 animate-pulse" />;
      case 'fertilizer':
        return <FlaskConical className="w-8 h-8 text-teal-600 animate-pulse" />;
      case 'weather':
        return <SunMedium className="w-8 h-8 text-amber-500 animate-pulse" />;
      case 'market':
        return <TrendingUp className="w-8 h-8 text-blue-600 animate-pulse" />;
      default:
        return <Leaf className="w-8 h-8 text-emerald-600 animate-pulse" />;
    }
  };

  const getFallbackGradient = () => {
    switch (fallbackType) {
      case 'crop':
        return 'from-emerald-50 via-green-50 to-emerald-100/50';
      case 'fertilizer':
        return 'from-teal-50 via-cyan-50 to-teal-100/50';
      case 'weather':
        return 'from-amber-50 via-orange-50 to-amber-100/50';
      case 'market':
        return 'from-blue-50 via-indigo-50 to-blue-100/50';
      default:
        return 'from-gray-50 via-slate-50 to-gray-100';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Loading Skeleton / Fallback Card when image fails or hasn't loaded */}
      {(error || !loaded) && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-br ${getFallbackGradient()} border border-gray-200/60 rounded-inherit transition-opacity duration-300`}
        >
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-2xs mb-1.5">
            {getFallbackIcon()}
          </div>
          <span className="text-xs font-semibold text-gray-700 text-center px-2 line-clamp-1">
            {alt}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">FarmMate Agronomic Visual</span>
        </div>
      )}

      {/* Actual Image */}
      {src && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
