import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Shield, ShieldAlert, ShieldCheck, RefreshCw, Database } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import type { FarmAlert } from '../hooks/useNotifications';
import { api } from '../services/api';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; text: string; badge: string }> = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-900', badge: 'bg-red-100 text-red-800' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
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
      <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
          <Bell className="w-3.5 h-3.5" />
          <span>Automated Farm Guard</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Alerts & System Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Configure proactive frost, rain, and market volatility dispatches.</p>
      </div>

      {/* Notification Permission Card */}
      <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              permission === 'granted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'
            }`}>
              {permission === 'granted' ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Push Notifications</h3>
              <p className="text-xs text-gray-500">
                {permission === 'granted' ? 'Active — your device will receive critical farm alerts' :
                 permission === 'denied' ? 'Blocked in browser — please enable permissions in site settings' :
                 'Enable browser alerts to receive instant frost, deluge, and price alerts'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && isSupported && (
            <button
              onClick={requestPermission}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              Enable Notifications
            </button>
          )}
          {permission === 'granted' && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
              ✓ Active
            </span>
          )}
        </div>
      </div>

      {/* Refresh & Status Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-gray-500">
          {alerts.length > 0 ? `${alerts.length} active alarm${alerts.length > 1 ? 's' : ''}` : 'No active alerts in queue'}
        </span>
        <button
          onClick={checkAlerts}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Evaluating...' : 'Refresh Alerts'}</span>
        </button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert: FarmAlert) => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
            return (
              <div key={alert.id} className={`${style.bg} border ${style.border} rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${style.icon}`}>
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-bold ${style.text}`}>{alert.title}</h3>
                      <span className="text-[10px] text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{alert.message}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.badge}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-gray-400 capitalize">{alert.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-green-100 rounded-2xl p-10 text-center shadow-sm">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">All Clear Across Your Plots</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No dangerous frost risks, extreme rainfall warnings, or market anomalies detected right now.
          </p>
        </div>
      )}

      {/* RAG Knowledge Base Status */}
      {ragStats && (
        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">RAG Vector Knowledge Base</h3>
              <p className="text-xs text-gray-500">Agronomic knowledge indexed for contextual AI advisory</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
              <p className={`text-sm font-bold mt-0.5 ${ragStats.status === 'active' ? 'text-emerald-700' : 'text-gray-500'}`}>
                {ragStats.status === 'active' ? '● Active' : '○ Standby'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Indexed Chunks</span>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{ragStats.total_chunks || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
