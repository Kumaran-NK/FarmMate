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
        return <Sprout className="w-10 h-10 text-emerald-400 animate-pulse" />;
      case 'fertilizer':
        return <FlaskConical className="w-10 h-10 text-teal-400 animate-pulse" />;
      case 'weather':
        return <SunMedium className="w-10 h-10 text-amber-400 animate-pulse" />;
      case 'market':
        return <TrendingUp className="w-10 h-10 text-blue-400 animate-pulse" />;
      default:
        return <Leaf className="w-10 h-10 text-emerald-400 animate-pulse" />;
    }
  };

  const getFallbackGradient = () => {
    switch (fallbackType) {
      case 'crop':
        return 'from-emerald-950/80 via-emerald-900/60 to-slate-900';
      case 'fertilizer':
        return 'from-teal-950/80 via-teal-900/60 to-slate-900';
      case 'weather':
        return 'from-amber-950/80 via-amber-900/60 to-slate-900';
      case 'market':
        return 'from-blue-950/80 via-blue-900/60 to-slate-900';
      default:
        return 'from-slate-900 via-slate-800 to-slate-900';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      {/* Loading Skeleton / Fallback Card when image fails or hasn't loaded */}
      {(error || !loaded) && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${getFallbackGradient()} border border-slate-800 rounded-inherit transition-opacity duration-300`}
        >
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-lg mb-2">
            {getFallbackIcon()}
          </div>
          <span className="text-xs font-semibold text-slate-300 text-center px-2 line-clamp-1">
            {alt}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">FarmMate Visual</span>
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
