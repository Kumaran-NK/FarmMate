/**
 * VoiceContext — Global voice state management for FarmMate
 *
 * Provides voice recognition (STT), text-to-speech (TTS), intent processing,
 * and voice-first interaction state to the entire application.
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useFarmContext } from './FarmContext';
import { api } from '../services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceResult {
  intent: string;
  confidence: number;
  detectedLanguage: string;
  spokenResponse: string;
  rawData?: any;
  paramsUsed?: Record<string, any>;
}

interface VoiceContextType {
  voiceStatus: VoiceStatus;
  isVoiceSupported: boolean;
  transcript: string;
  interimTranscript: string;
  lastResult: VoiceResult | null;
  error: string | null;
  isSpeaking: boolean;
  startVoice: () => void;
  stopVoice: () => void;
  cancelSpeech: () => void;
  processTranscription: (text: string) => Promise<void>;
  voiceHistory: VoiceResult[];
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { location, latestCropPrediction, latestWeather, language } = useFarmContext();

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [lastResult, setLastResult] = useState<VoiceResult | null>(null);
  const [voiceHistory, setVoiceHistory] = useState<VoiceResult[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const processingRef = useRef(false);

  const tts = useTextToSpeech();

  // Build farm context for the backend
  const buildFarmContext = useCallback(() => ({
    location: `${location.city}, ${location.state}`,
    lat: location.lat,
    lon: location.lon,
    active_crop: latestCropPrediction?.predicted_crop || undefined,
    weather_temp: latestWeather?.current_weather.temp
      ? `${latestWeather.current_weather.temp}°C`
      : undefined,
    rain_probability: latestWeather?.rain_prediction.probability
      ? `${(latestWeather.rain_prediction.probability * 100).toFixed(0)}%`
      : undefined,
  }), [location, latestCropPrediction, latestWeather]);

  // Process a transcription through the backend voice pipeline
  const processTranscription = useCallback(async (text: string) => {
    if (processingRef.current || !text.trim()) return;

    processingRef.current = true;
    setVoiceStatus('processing');
    setVoiceError(null);

    try {
      const response = await api.processVoice({
        transcription: text,
        language: language === 'ta' ? 'ta' : 'en',
        context: buildFarmContext(),
      });

      const result: VoiceResult = {
        intent: response.intent,
        confidence: response.confidence,
        detectedLanguage: response.detected_language,
        spokenResponse: response.spoken_response,
        rawData: response.raw_data,
        paramsUsed: response.params_used,
      };

      setLastResult(result);
      setVoiceHistory((prev) => [result, ...prev].slice(0, 20));

      // Auto-speak the response
      if (autoSpeak && result.spokenResponse) {
        setVoiceStatus('speaking');
        tts.speak(result.spokenResponse, result.detectedLanguage);

        // Wait for speech to finish, then go idle
        const checkSpeechDone = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(checkSpeechDone);
            setVoiceStatus('idle');
          }
        }, 200);
      } else {
        setVoiceStatus('idle');
      }
    } catch (err) {
      console.error('Voice processing error:', err);
      setVoiceError('Failed to process voice command. Please try again.');
      setVoiceStatus('error');

      setTimeout(() => setVoiceStatus('idle'), 3000);
    } finally {
      processingRef.current = false;
    }
  }, [language, buildFarmContext, autoSpeak, tts]);

  // Voice recognition hook
  const recognition = useVoiceRecognition({
    language: language === 'ta' ? 'ta-IN' : 'en-IN',
    continuous: false,
    onResult: (transcript) => {
      processTranscription(transcript);
    },
  });

  const startVoice = useCallback(() => {
    tts.stop();
    setVoiceError(null);
    setVoiceStatus('listening');
    recognition.resetTranscript();
    recognition.startListening();
  }, [recognition, tts]);

  const stopVoice = useCallback(() => {
    recognition.stopListening();
    if (voiceStatus === 'listening') {
      setVoiceStatus('idle');
    }
  }, [recognition, voiceStatus]);

  const cancelSpeech = useCallback(() => {
    tts.stop();
    setVoiceStatus('idle');
  }, [tts]);

  return (
    <VoiceContext.Provider
      value={{
        voiceStatus,
        isVoiceSupported: recognition.isSupported,
        transcript: recognition.transcript,
        interimTranscript: recognition.interimTranscript,
        lastResult,
        error: voiceError || recognition.error,
        isSpeaking: tts.isSpeaking,
        startVoice,
        stopVoice,
        cancelSpeech,
        processTranscription,
        voiceHistory,
        autoSpeak,
        setAutoSpeak,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useVoiceContext = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return ctx;
};
