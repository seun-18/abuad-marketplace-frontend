import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChatSocket } from '../hooks/useChatSocket';

const NotificationContext = createContext({
  items: [],
  unread: 0,
  markAllRead: () => {},
  markRead: () => {},
  connected: false,
});

const STORAGE_KEY = 'abuad_notifications_v1';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

function saveStored(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [items, setItems] = useState(() => loadStored());
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const pushNotification = useCallback((n) => {
    if (!n) return;
    const entry = {
      id: n.id || `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: n.kind || 'info',
      title: n.title || 'Notification',
      body: n.body || '',
      meta: n.meta || {},
      created_at: n.created_at || new Date().toISOString(),
      read: false,
    };
    setItems((prev) => {
      if (prev.some((x) => x.id === entry.id)) return prev;
      const next = [entry, ...prev].slice(0, 40);
      saveStored(next);
      return next;
    });
    setToast(entry);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5500);

    // Browser notification if permitted
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(entry.title, { body: entry.body });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const onMessage = useCallback(
    (msg) => {
      if (msg?.type === 'notification' && msg.data) {
        pushNotification(msg.data);
      }
    },
    [pushNotification]
  );

  const { connected } = useChatSocket({
    token,
    onMessage,
    enabled: Boolean(user && token),
  });

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((x) => ({ ...x, read: true }));
      saveStored(next);
      return next;
    });
  }, []);

  const markRead = useCallback((id) => {
    setItems((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, read: true } : x));
      saveStored(next);
      return next;
    });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const unread = useMemo(() => items.filter((x) => !x.read).length, [items]);

  const value = useMemo(
    () => ({
      items,
      unread,
      markAllRead,
      markRead,
      connected,
      toast,
      clearToast,
      requestBrowserPermission: () => {
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        } catch {
          /* ignore */
        }
      },
    }),
    [items, unread, markAllRead, markRead, connected, toast, clearToast]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
