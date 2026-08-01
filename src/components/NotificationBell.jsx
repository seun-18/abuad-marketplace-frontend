import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationBell = ({ className = '' }) => {
  const { user } = useAuth();
  const { items, unread, markAllRead, markRead, toast, clearToast, requestBrowserPermission } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!user) return null;

  const payoutLink =
    user.role === 'super_admin'
      ? '/admin/payouts'
      : user.role === 'vendor'
        ? '/vendor/payouts'
        : null;

  return (
    <div className={`notification-bell-wrap ${className}`} ref={rootRef}>
      <button
        type="button"
        className="dashboard-header-button notification-bell-btn"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        onClick={() => {
          setOpen((v) => !v);
          requestBrowserPermission?.();
        }}
      >
        <Bell size={16} aria-hidden="true" />
        {unread > 0 && <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="notification-mark-all">
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-dropdown-list">
            {items.length === 0 ? (
              <p className="notification-empty">No notifications yet.</p>
            ) : (
              items.slice(0, 20).map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`notification-item ${n.read ? '' : 'unread'}`}
                  onClick={() => markRead(n.id)}
                >
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                  <em>
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                    {n.kind ? ` · ${n.kind.replace(/_/g, ' ')}` : ''}
                  </em>
                </button>
              ))
            )}
          </div>
          {payoutLink && (
            <Link to={payoutLink} className="notification-footer-link" onClick={() => setOpen(false)}>
              Open payouts →
            </Link>
          )}
        </div>
      )}

      {toast && (
        <div className="notification-toast" role="status">
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.body}</p>
          </div>
          <button type="button" onClick={clearToast} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
