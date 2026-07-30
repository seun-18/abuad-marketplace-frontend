import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('loading'); // loading | success | failed
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('failed');
      setMessage('Missing verification token.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/auth/verify_email.php?token=${encodeURIComponent(token)}`);
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
      <div className="auth-card">
        <p className="eyebrow" style={{ color: '#ffb703', marginBottom: '0.75rem' }}>
          ABUAD Market Place
        </p>
        <h1>{status === 'success' ? 'Email verified' : status === 'failed' ? 'Verification issue' : 'Verifying…'}</h1>
        <p className="auth-subtitle">{message}</p>
        {status !== 'loading' && (
          <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">Go to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
