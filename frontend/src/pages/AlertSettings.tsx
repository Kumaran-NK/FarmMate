import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Shield, ShieldAlert, ShieldCheck, RefreshCw, Database } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import type { FarmAlert } from '../hooks/useNotifications';
import { api } from '../services/api';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/40', icon: 'text-red-400', text: 'text-red-300' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', icon: 'text-amber-400', text: 'text-amber-300' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', icon: 'text-blue-400', text: 'text-blue-300' },
};

export const AlertSettings: React.FC = () => {
  const { permission, alerts, loading, isSupported, requestPermission, checkAlerts } = useNotifications();
  const [ragStats, setRagStats] = useState<any>(null);

  useEffect(() => {
    api.getRagStats().then(setRagStats);
  }, []);

  const SeverityIcon = ({ severity }: { severity: string }) => {
    if (severity === 'critical') return <ShieldAlert className="w-5 h-5" />;
    if (severity === 'warning') return <Shield className="w-5 h-5" />;
    return <ShieldCheck className="w-5 h-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
          <Bell className="w-3.5 h-3.5" />
          <span>Smart Alerts</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Farm Alerts & Notifications</h1>
        <p className="text-sm text-slate-400 mt-1">Proactive weather, frost, and market alerts for your farm.</p>
      </div>

      {/* Notification Permission Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              permission === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {permission === 'granted' ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Browser Notifications</h3>
              <p className="text-xs text-slate-400">
                {permission === 'granted' ? 'Enabled — you will receive alerts' :
                 permission === 'denied' ? 'Blocked — enable in browser settings' :
                 'Enable to receive frost and rain alerts'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && isSupported && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold hover:from-emerald-500 transition-all shadow-lg"
            >
              Enable Alerts
            </button>
          )}
          {permission === 'granted' && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              ✓ Active
            </span>
          )}
        </div>
      </div>

      {/* Refresh & Status Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {alerts.length > 0 ? `${alerts.length} active alert${alerts.length > 1 ? 's' : ''}` : 'No active alerts'}
        </span>
        <button
          onClick={checkAlerts}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Checking...' : 'Check Now'}</span>
        </button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert: FarmAlert) => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
            return (
              <div key={alert.id} className={`${style.bg} border ${style.border} rounded-2xl p-5 shadow-lg`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${style.icon}`}>
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-bold ${style.text}`}>{alert.title}</h3>
                      <span className="text-[10px] text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500">{alert.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 mb-1">All Clear</h3>
          <p className="text-xs text-slate-500">No weather or frost alerts for your farm right now.</p>
        </div>
      )}

      {/* RAG Knowledge Base Status */}
      {ragStats && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">RAG Knowledge Base</h3>
              <p className="text-xs text-slate-400">Agricultural knowledge indexed for AI responses</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Status</span>
              <p className={`text-sm font-bold mt-0.5 ${ragStats.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {ragStats.status === 'active' ? '● Active' : '○ Unavailable'}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Indexed Chunks</span>
              <p className="text-sm font-bold text-white mt-0.5">{ragStats.total_chunks || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
