/**
 * useTextToSpeech — Custom hook for browser Text-to-Speech
 *
 * Uses the Web SpeechSynthesis API to speak responses aloud.
 * Supports language detection and Tamil/Hindi voice selection.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseTextToSpeechReturn {
  speak: (text: string, language?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const findBestVoice = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      if (availableVoices.length === 0) return null;

      // Language code mapping
      const langMap: Record<string, string[]> = {
        ta: ['ta-IN', 'ta'],
        hi: ['hi-IN', 'hi'],
        en: ['en-IN', 'en-US', 'en-GB', 'en'],
        tanglish: ['en-IN', 'en-US'], // Tanglish — use Indian English voice
      };

      const candidates = langMap[lang] || langMap['en'];

      // Try exact match first
      for (const code of candidates) {
        const voice = availableVoices.find(
          (v) => v.lang.toLowerCase() === code.toLowerCase()
        );
        if (voice) return voice;
      }

      // Try prefix match
      for (const code of candidates) {
        const prefix = code.split('-')[0];
        const voice = availableVoices.find(
          (v) => v.lang.toLowerCase().startsWith(prefix)
        );
        if (voice) return voice;
      }

      // Fallback to default
      return availableVoices.find((v) => v.default) || availableVoices[0] || null;
    },
    [availableVoices]
  );

  const speak = useCallback(
    (text: string, language: string = 'en') => {
      if (!isSupported || !text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice based on language
      const voice = findBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      }

      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, findBestVoice]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    availableVoices,
  };
}
