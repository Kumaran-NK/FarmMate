import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Trash2 } from 'lucide-react';
import { useFarmContext } from '../context/FarmContext';
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

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am **FarmMate AI**, your agricultural decision support assistant. How can I help with your farming, crop selection, soil nutrients, or weather interpretation in **${location.city}** today?`
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

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setInputMsg('');
    setLoading(true);

    // Build context dictionary
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

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. I am ready to answer your farming questions in English or Tamil.`
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-1">
            <Bot className="w-3.5 h-3.5" />
            <span>Groq Llama-3.3 70B Conversational Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">FarmMate AI Assistant</h1>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-emerald-300 whitespace-nowrap transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md h-[480px] flex flex-col justify-between">
        
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                      : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-tr-none'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-400 animate-pulse">
                FarmMate AI is thinking...
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
          className="mt-4 flex items-center space-x-2 pt-3 border-t border-slate-800/80"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask about crops, fertilizers, weather or irrigation (English / Tamil)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
