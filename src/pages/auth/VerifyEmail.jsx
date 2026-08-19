import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('failed');
      setMessage('Missing verification token. Open the link from your email.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(
          `/auth/verify_email.php?token=${encodeURIComponent(token)}`
        );
        if (cancelled) return;
        if (res.data?.success) {
          setStatus('success');
          setMessage(res.data.message || 'Email verified. You can log in.');
        } else {
          setStatus('failed');
          setMessage(res.data?.message || 'Verification failed.');
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('failed');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand-bar">
          <Link to="/" className="auth-brand-link" aria-label="Back to home">
            <span className="auth-brand-mark">A</span>
            <span>
              ABUAD <em>Market</em>
            </span>
          </Link>
        </div>

        <div className="auth-card">
          <header className="auth-card-head">
            <p className="auth-kicker">Email verification</p>
            <h1>
              {status === 'success'
                ? 'Email verified'
                : status === 'failed'
                  ? 'Verification issue'
                  : 'Verifying…'}
            </h1>
            <p className="auth-subtitle">{message}</p>
          </header>

          {status === 'success' ? (
            <div className="auth-alert auth-alert-success">You can now sign in to your account.</div>
          ) : null}
          {status === 'failed' ? (
            <div className="auth-alert auth-alert-error">{message}</div>
          ) : null}

          {status !== 'loading' && (
            <p className="auth-footer">
              <Link to="/login">Go to sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
