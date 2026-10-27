/**
 * useWebSocket — Generic WebSocket hook with auto-reconnection
 *
 * Used for real-time voice streaming and future streaming features.
 */
import { useState, useRef, useCallback, useEffect } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  send: (data: any) => void;
  lastMessage: any | null;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(
  url: string,
  options: {
    autoConnect?: boolean;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxRetries?: number;
    onMessage?: (data: any) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
  } = {}
): UseWebSocketReturn {
  const {
    autoConnect = false,
    reconnect = true,
    reconnectInterval = 3000,
    maxRetries = 5,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const unmountedRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    clearReconnectTimer();
    setStatus('connecting');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (unmountedRef.current) return;
        setStatus('connected');
        retriesRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        if (unmountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch {
          setLastMessage(event.data);
          onMessage?.(event.data);
        }
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        setStatus('disconnected');
        onClose?.();

        // Auto-reconnect
        if (reconnect && retriesRef.current < maxRetries) {
          retriesRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            if (!unmountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        if (unmountedRef.current) return;
        setStatus('error');
        onError?.(error);
      };

      wsRef.current = ws;
    } catch {
      setStatus('error');
    }
  }, [url, reconnect, reconnectInterval, maxRetries, onMessage, onOpen, onClose, onError, clearReconnectTimer]);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    retriesRef.current = maxRetries; // Prevent reconnect
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, [clearReconnectTimer, maxRetries]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  // Auto-connect if requested
  useEffect(() => {
    unmountedRef.current = false;
    if (autoConnect) {
      connect();
    }
    return () => {
      unmountedRef.current = true;
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, send, lastMessage, connect, disconnect };
}
