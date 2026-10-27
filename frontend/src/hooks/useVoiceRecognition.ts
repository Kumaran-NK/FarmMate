/**
 * useVoiceRecognition — Custom hook for browser Speech-to-Text
 *
 * Uses the Web Speech API (webkitSpeechRecognition) for real-time voice
 * transcription. Provides start/stop controls, interim results, and
 * error handling with graceful fallback.
 */
import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export interface UseVoiceRecognitionReturn extends VoiceRecognitionState {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Check for browser support
const SpeechRecognition =
  (typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
  null;

export function useVoiceRecognition(
  options: {
    language?: string;
    continuous?: boolean;
    onResult?: (transcript: string) => void;
    onInterim?: (interim: string) => void;
  } = {}
): UseVoiceRecognitionReturn {
  const { language = 'en-IN', continuous = false, onResult, onInterim } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported = SpeechRecognition !== null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript(finalText.trim());
        setInterimTranscript('');
        onResult?.(finalText.trim());
      }
      if (interimText) {
        setInterimTranscript(interimText.trim());
        onInterim?.(interimText.trim());
      }
    };

    recognition.onerror = (event: any) => {
      const errorMap: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not found. Please check your device.',
        'not-allowed': 'Microphone permission denied. Please allow access in browser settings.',
        'network': 'Network error during speech recognition.',
        'aborted': '', // Intentional abort — not an error
      };

      const msg = errorMap[event.error] || `Speech recognition error: ${event.error}`;
      if (msg) {
        setError(msg);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [isSupported, language, continuous, onResult, onInterim]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
