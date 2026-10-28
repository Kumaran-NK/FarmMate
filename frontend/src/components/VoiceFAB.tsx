/**
 * VoiceFAB — Floating Action Button for voice-first interaction
 *
 * Persistent mic button visible on every page. Animates through states:
 * idle → listening → processing → speaking
 */
import React from 'react';
import { Mic, MicOff, Loader2, Volume2, X } from 'lucide-react';
import { useVoiceContext } from '../context/VoiceContext';

export const VoiceFAB: React.FC = () => {
  const {
    voiceStatus,
    isVoiceSupported,
    startVoice,
    stopVoice,
    cancelSpeech,
    interimTranscript,
    transcript,
    lastResult,
    error,
  } = useVoiceContext();

  if (!isVoiceSupported) return null;

  const handleClick = () => {
    switch (voiceStatus) {
      case 'idle':
      case 'error':
        startVoice();
        break;
      case 'listening':
        stopVoice();
        break;
      case 'speaking':
        cancelSpeech();
        break;
      case 'processing':
        break;
    }
  };

  const statusConfig = {
    idle: {
      icon: <Mic className="w-6 h-6" />,
      bg: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'ring-4 ring-emerald-500/20',
      shadow: 'shadow-lg shadow-emerald-700/30',
      pulse: '',
      label: 'Tap to speak',
    },
    listening: {
      icon: <Mic className="w-6 h-6 animate-pulse" />,
      bg: 'bg-red-600',
      ring: 'ring-4 ring-red-500/30',
      shadow: 'shadow-xl shadow-red-700/40',
      pulse: 'voice-fab-pulse',
      label: 'Listening...',
    },
    processing: {
      icon: <Loader2 className="w-6 h-6 animate-spin" />,
      bg: 'bg-amber-600',
      ring: 'ring-4 ring-amber-400/30',
      shadow: 'shadow-lg shadow-amber-700/30',
      pulse: '',
      label: 'Processing...',
    },
    speaking: {
      icon: <Volume2 className="w-6 h-6 animate-pulse" />,
      bg: 'bg-blue-600',
      ring: 'ring-4 ring-blue-500/30',
      shadow: 'shadow-xl shadow-blue-700/40',
      pulse: 'voice-fab-speaking',
      label: 'Speaking...',
    },
    error: {
      icon: <MicOff className="w-6 h-6" />,
      bg: 'bg-gray-600',
      ring: 'ring-2 ring-red-400/40',
      shadow: 'shadow-lg shadow-gray-700/30',
      pulse: '',
      label: 'Tap to retry',
    },
  };

  const config = statusConfig[voiceStatus];
  const showTranscript = voiceStatus === 'listening' && (interimTranscript || transcript);
  const showResult = voiceStatus === 'speaking' && lastResult;
  const showError = voiceStatus === 'error' && error;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
      {/* Transcript / Result Bubble */}
      {(showTranscript || showResult || showError) && (
        <div className="max-w-xs sm:max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-xl">
            {showTranscript && (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Listening</span>
                </div>
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  {interimTranscript || transcript}
                </p>
              </>
            )}
            {showResult && lastResult && (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      {lastResult.intent.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelSpeech(); }}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {lastResult.spokenResponse.length > 200
                    ? lastResult.spokenResponse.slice(0, 200) + '...'
                    : lastResult.spokenResponse}
                </p>
              </>
            )}
            {showError && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <MicOff className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Error</span>
                </div>
                <p className="text-xs text-gray-700">{error}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        id="voice-fab"
        onClick={handleClick}
        disabled={voiceStatus === 'processing'}
        className={`
          relative w-14 h-14 rounded-full flex items-center justify-center
          text-white transition-all duration-300 ease-out cursor-pointer
          hover:scale-105 active:scale-95
          disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100
          ${config.bg} ${config.ring} ${config.shadow} ${config.pulse}
        `}
        title={config.label}
        aria-label={config.label}
      >
        {config.icon}
      </button>

      {/* Status Label */}
      <span className="text-[10px] font-semibold text-gray-500 text-center select-none bg-white/80 px-2 py-0.5 rounded-full border border-gray-100 shadow-2xs">
        {config.label}
      </span>

      {/* CSS animations for the FAB */}
      <style>{`
        @keyframes voice-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 16px rgba(220, 38, 38, 0); }
        }
        @keyframes voice-speaking-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
        }
        .voice-fab-pulse {
          animation: voice-pulse 1.5s ease-in-out infinite;
        }
        .voice-fab-speaking {
          animation: voice-speaking-ring 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-2 {
          from { transform: translateY(8px); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out, slide-in-from-bottom-2 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
