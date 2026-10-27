/**
 * useNotifications — Push notification hook for browser alerts
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useFarmContext } from '../context/FarmContext';

export interface FarmAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  category: string;
  timestamp: string;
  data?: any;
}

export function useNotifications() {
  const { location } = useFarmContext();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const isSupported = typeof Notification !== 'undefined';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const showNotification = useCallback((alert: FarmAlert) => {
    if (permission !== 'granted') return;
    const icon = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
    try {
      new Notification(`${icon} ${alert.title}`, {
        body: alert.message,
        icon: '/vite.svg',
        tag: alert.id,
        requireInteraction: alert.severity === 'critical',
      });
    } catch { /* SW may handle instead */ }
  }, [permission]);

  const checkAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.checkAlerts(location.city);
      const newAlerts: FarmAlert[] = res.alerts || [];
      setAlerts(newAlerts);
      // Show browser notification for critical/warning
      newAlerts.forEach((a: FarmAlert) => {
        if (a.severity === 'critical' || a.severity === 'warning') {
          showNotification(a);
        }
      });
    } catch { /* silent fail */ }
    setLoading(false);
  }, [location.city, showNotification]);

  // Auto-check alerts every 15 minutes
  useEffect(() => {
    checkAlerts();
    intervalRef.current = setInterval(checkAlerts, 15 * 60 * 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [checkAlerts]);

  return { permission, alerts, loading, isSupported, requestPermission, checkAlerts };
}
