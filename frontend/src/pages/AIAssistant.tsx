import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Trash2, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useFarmContext } from '../context/FarmContext';
import { useVoiceContext } from '../context/VoiceContext';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

const SUGGESTED_PROMPTS = [
  '🌱 What crop should I grow in my soil?',
  '💧 How much water does my crop need today?',
  '🌧 Will rain affect my irrigation plan?',
  '🧪 Explain my fertilizer recommendation',
  '🌾 How can I improve my expected harvest yield?',
  'Tomorrow rain varuma?'
];

export const AIAssistant: React.FC = () => {
  const { location, latestCropPrediction, latestWeather } = useFarmContext();
  const {
    voiceStatus,
    isVoiceSupported,
    startVoice,
    stopVoice,
    cancelSpeech,
    transcript,
    interimTranscript,
    lastResult,
    autoSpeak,
    setAutoSpeak,
  } = useVoiceContext();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am **FarmMate AI**, your agricultural decision support assistant. You can type or 🎙️ **speak** to me! How can I help with your farming, crop selection, soil nutrients, or weather interpretation in **${location.city}** today?`
    }
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // When voice returns a result, add it to the chat
  useEffect(() => {
    if (lastResult && lastResult.spokenResponse && voiceStatus !== 'listening') {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.content === lastResult.spokenResponse) return;

      const voiceUserMsg: ChatMessage = {
        role: 'user',
        content: `🎙️ ${transcript || lastResult.paramsUsed?.message || 'Voice command'}`,
      };

      const voiceAiMsg: ChatMessage = {
        role: 'assistant',
        content: lastResult.spokenResponse,
      };

      setMessages((prev) => [...prev, voiceUserMsg, voiceAiMsg]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setInputMsg('');
    setLoading(true);

    const farmContext: Record<string, any> = {
      location: `${location.city}, ${location.state}`,
      active_crop: latestCropPrediction?.predicted_crop || 'Not calculated yet',
      weather_temp: latestWeather?.current_weather.temp ? `${latestWeather.current_weather.temp}°C` : 'Unknown',
      rain_probability: latestWeather?.rain_prediction.probability ? `${(latestWeather.rain_prediction.probability * 100).toFixed(0)}%` : 'Unknown'
    };

    try {
      const reply = await api.sendChatMessage(query, messages, farmContext);
      setMessages([...updatedHistory, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to FarmMate AI. Please check your server connection and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceMic = () => {
    if (voiceStatus === 'listening') {
      stopVoice();
    } else if (voiceStatus === 'speaking') {
      cancelSpeech();
    } else {
      startVoice();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. I am ready to answer your farming questions in English or Tamil. You can type or 🎙️ speak!`
      }
    ]);
  };

  const voiceMicColor = {
    idle: 'text-emerald-700 hover:bg-emerald-50 border-emerald-200 bg-white',
    listening: 'text-red-700 bg-red-50 border-red-300 animate-pulse',
    processing: 'text-amber-700 bg-amber-50 border-amber-300 cursor-wait',
    speaking: 'text-blue-700 bg-blue-50 border-blue-300 animate-pulse',
    error: 'text-red-700 hover:bg-red-50 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-1">
            <Bot className="w-3.5 h-3.5" />
            <span>FarmMate Agronomic Intelligence</span>
            {isVoiceSupported && (
              <>
                <span className="text-emerald-300">•</span>
                <Mic className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Voice Active</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">AI Farm Assistant</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-speak toggle */}
          {isVoiceSupported && (
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                autoSpeak
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
              title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
            </button>
          )}

          <button
            onClick={handleClear}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 border border-gray-200 transition-colors"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Voice Status Banner */}
      {voiceStatus === 'listening' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-pulse">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <Mic className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-red-800">Listening to your voice...</span>
            {interimTranscript && (
              <p className="text-sm text-red-950 mt-0.5 font-medium">{interimTranscript}</p>
            )}
          </div>
          <button
            onClick={stopVoice}
            className="px-3 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold hover:bg-red-200 transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {voiceStatus === 'processing' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span className="text-xs font-bold text-amber-800">Processing agronomic query...</span>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-green-200 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-medium text-gray-700 hover:text-emerald-800 whitespace-nowrap shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm h-[520px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isVoiceMsg = isUser && msg.content.startsWith('🎙️');
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? isVoiceMsg
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isUser ? (
                    isVoiceMsg ? <Mic className="w-4 h-4" /> : <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? isVoiceMsg
                        ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tr-none'
                        : 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
                      : 'bg-gray-50 border border-gray-200/80 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs text-gray-500 animate-pulse">
                FarmMate AI is analyzing your agronomic question...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 flex items-center space-x-2 pt-3 border-t border-gray-100"
        >
          {/* Voice Mic Button */}
          {isVoiceSupported && (
            <button
              type="button"
              onClick={handleVoiceMic}
              disabled={voiceStatus === 'processing'}
              className={`p-3 rounded-xl border transition-all disabled:opacity-50 cursor-pointer ${
                voiceMicColor[voiceStatus]
              }`}
              title={voiceStatus === 'listening' ? 'Stop listening' : 'Speak your question'}
            >
              {voiceStatus === 'listening' ? (
                <MicOff className="w-4 h-4" />
              ) : voiceStatus === 'speaking' ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask about crops, fertilizers, weather or irrigation (English / Tamil)..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
