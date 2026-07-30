import { useEffect, useRef, useCallback, useState } from 'react';
import { WS_URL } from '../config/runtime';

/**
 * Real-time chat over WebSocket.
 * Falls back gracefully if the WS server is offline (caller can still use REST).
 */
export function useChatSocket({ token, onMessage, enabled = true }) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const joinedRef = useRef(new Set());
  const [connected, setConnected] = useState(false);
  const [lastError, setLastError] = useState('');

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !token) return undefined;

    let closed = false;
    let retryTimer = null;
    let attempt = 0;

    const connect = () => {
      if (closed) return;
      const url = `${WS_URL}?token=${encodeURIComponent(token)}`;
      let ws;
      try {
        ws = new WebSocket(url);
      } catch (e) {
        setLastError(e.message);
        scheduleRetry();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setConnected(true);
        setLastError('');
        // Re-join rooms after reconnect
        for (const id of joinedRef.current) {
          ws.send(JSON.stringify({ type: 'join', conversation_id: id }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'error') {
            setLastError(msg.message || 'WebSocket error');
          }
          onMessageRef.current?.(msg);
        } catch {
          /* ignore */
        }
      };

      ws.onerror = () => {
        setLastError('WebSocket connection error');
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (!closed) scheduleRetry();
      };
    };

    const scheduleRetry = () => {
      attempt += 1;
      const delay = Math.min(10000, 1000 * attempt);
      retryTimer = setTimeout(connect, delay);
    };

    connect();

    const pingTimer = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      try {
        wsRef.current?.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
    };
  }, [token, enabled]);

  const joinConversation = useCallback((conversationId) => {
    const id = Number(conversationId);
    if (!id) return;
    joinedRef.current.add(id);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'join', conversation_id: id }));
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    const id = Number(conversationId);
    joinedRef.current.delete(id);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave', conversation_id: id }));
    }
  }, []);

  const sendMessage = useCallback((conversationId, message) => {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      try {
        ws.send(
          JSON.stringify({
            type: 'send',
            conversation_id: Number(conversationId),
            message,
          })
        );
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }, []);

  return { connected, lastError, joinConversation, leaveConversation, sendMessage };
}

export default useChatSocket;
