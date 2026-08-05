import { AlertCircle, RefreshCw, X } from 'lucide-react';

/**
 * Accessible inline error banner with optional retry.
 */
const ErrorAlert = ({
  message,
  onRetry,
  onDismiss,
  title = 'Something went wrong',
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`error-alert ${className}`.trim()}
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        padding: '0.9rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid rgba(190, 18, 60, 0.22)',
        background: 'rgba(255, 241, 242, 0.95)',
        color: '#9f1239',
      }}
    >
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#881337' }}>
          {title}
        </p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', lineHeight: 1.5, color: '#9f1239' }}>
          {message}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            style={{
              marginTop: '0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid rgba(190, 18, 60, 0.3)',
              background: '#fff',
              color: '#9f1239',
              borderRadius: '999px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Try again
          </button>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#9f1239',
            cursor: 'pointer',
            padding: 2,
            opacity: 0.7,
          }}
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
};

export default ErrorAlert;
