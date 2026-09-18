import React from 'react';
import './FarmScene.css';

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'fog'
  | 'frost'
  | 'unknown';

interface FarmSceneProps {
  weatherState?: WeatherCondition;
  className?: string;
  showOverlayText?: boolean;
}

export const FarmScene: React.FC<FarmSceneProps> = ({
  weatherState = 'sunny',
  className = '',
}) => {
  const isRainy = weatherState === 'rain' || weatherState === 'storm';
  const isStormy = weatherState === 'storm';
  const isFrosty = weatherState === 'frost';
  const isCloudy = weatherState === 'cloudy' || weatherState === 'partly_cloudy' || isRainy;

  return (
    <div className={`farm-scene-container relative ${className}`}>
      {/* Dynamic Background Sky Colors */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isStormy
            ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950'
            : isRainy
            ? 'bg-gradient-to-b from-slate-900 via-slate-850 to-teal-950'
            : isFrosty
            ? 'bg-gradient-to-b from-cyan-950 via-slate-900 to-emerald-950'
            : isCloudy
            ? 'bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950'
            : 'bg-gradient-to-b from-sky-900 via-emerald-950/70 to-slate-950'
        }`}
      />

      <svg
        viewBox="0 0 800 300"
        className="w-full h-full object-cover relative z-10"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Sun Glow Gradient */}
          <radialGradient id="sunGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>

          {/* Hill Gradient */}
          <linearGradient id="hillBackGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#065f46" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="hillFrontGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#047857" stopOpacity="1" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="1" />
          </linearGradient>

          {/* Crop Blade Gradient */}
          <linearGradient id="cropGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          
          <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Sun / Sun Glow */}
        {!isStormy && (
          <g className="animate-sun-glow">
            <circle cx="680" cy="70" r="45" fill="url(#sunGlowGrad)" />
            <circle cx="680" cy="70" r="22" fill={isFrosty ? "#e0f2fe" : "#fef08a"} />
          </g>
        )}

        {/* Birds Flying across the horizon */}
        {!isRainy && (
          <g className="animate-bird stroke-emerald-300/40 fill-none" strokeWidth="1.5">
            <path d="M 0,0 Q 8,-8 16,0 Q 24,-8 32,0" />
            <path d="M 40,10 Q 46,4 52,10 Q 58,4 64,10" />
          </g>
        )}

        {/* Clouds */}
        {isCloudy && (
          <g className="fill-slate-200/20">
            {/* Cloud 1 */}
            <path
              className="animate-cloud-slow"
              d="M 20,80 Q 30,60 50,60 Q 70,50 90,65 Q 110,60 120,75 Q 130,90 110,95 Q 30,95 20,80 Z"
            />
            {/* Cloud 2 */}
            <path
              className="animate-cloud-fast"
              d="M 400,50 Q 415,35 435,35 Q 455,25 475,40 Q 495,35 505,50 Q 515,65 495,70 Q 410,70 400,50 Z"
            />
          </g>
        )}

        {/* Background Rolling Hills */}
        <path
          d="M 0 180 Q 200 130 400 170 T 800 150 L 800 300 L 0 300 Z"
          fill="url(#hillBackGrad)"
        />

        {/* Foreground Crop Field Hill */}
        <path
          d="M 0 210 Q 250 180 500 220 T 800 200 L 800 300 L 0 300 Z"
          fill="url(#hillFrontGrad)"
        />

        {/* Animated Crops / Plants Swaying */}
        <g className="animate-crop-sway">
          {/* Row of Crops */}
          <path d="M 60 220 Q 58 200 68 185 Q 75 200 70 220 Z" fill="url(#cropGrad)" />
          <path d="M 65 220 Q 72 205 82 192 Q 78 210 70 220 Z" fill="url(#cropGrad)" />
          
          <path d="M 180 230 Q 178 205 188 190 Q 195 205 190 230 Z" fill="url(#wheatGrad)" />
          <path d="M 185 230 Q 192 210 202 195 Q 198 215 190 230 Z" fill="url(#wheatGrad)" />

          <path d="M 320 225 Q 318 200 328 185 Q 335 200 330 225 Z" fill="url(#cropGrad)" />
          <path d="M 450 240 Q 448 215 458 200 Q 465 215 460 240 Z" fill="url(#wheatGrad)" />

          <path d="M 600 220 Q 598 195 608 180 Q 615 195 610 220 Z" fill="url(#cropGrad)" />
          <path d="M 720 215 Q 718 190 728 175 Q 735 190 730 215 Z" fill="url(#wheatGrad)" />
        </g>

        <g className="animate-crop-sway-alt">
          <path d="M 110 225 Q 105 205 115 190 Q 120 205 118 225 Z" fill="url(#wheatGrad)" />
          <path d="M 240 235 Q 235 210 248 195 Q 252 212 248 235 Z" fill="url(#cropGrad)" />
          <path d="M 390 230 Q 385 205 398 190 Q 402 208 398 230 Z" fill="url(#cropGrad)" />
          <path d="M 530 225 Q 525 200 538 185 Q 542 202 538 225 Z" fill="url(#wheatGrad)" />
          <path d="M 670 230 Q 665 205 678 190 Q 682 208 678 230 Z" fill="url(#cropGrad)" />
        </g>

        {/* Rain Effect */}
        {isRainy && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 8" opacity="0.6">
            <line x1="100" y1="20" x2="80" y2="180" className="animate-rain" />
            <line x1="250" y1="10" x2="230" y2="190" className="animate-rain" style={{ animationDelay: '0.3s' }} />
            <line x1="420" y1="30" x2="400" y2="210" className="animate-rain" style={{ animationDelay: '0.6s' }} />
            <line x1="600" y1="15" x2="580" y2="195" className="animate-rain" style={{ animationDelay: '0.2s' }} />
            <line x1="730" y1="40" x2="710" y2="220" className="animate-rain" style={{ animationDelay: '0.8s' }} />
          </g>
        )}
      </svg>
    </div>
  );
};
