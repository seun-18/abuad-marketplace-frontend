import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const VerifyPhone = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const presetPhone = location.state?.phone || '';
  const userId = location.state?.user_id || null;

  const [phone, setPhone] = useState(presetPhone);
  const [code, setCode] = useState('');
  const [step, setStep] = useState(presetPhone ? 'code' : 'phone'); // phone | code
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  const sendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    setMessage('');
    setSending(true);
    try {
      const res = await api.post('/auth/send_phone_otp.php', {
        phone: phone.trim(),
        user_id: userId,
      });
      setHint(res.data?.data?.phone_hint || '');
      setMessage(res.data?.message || 'Code sent.');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send SMS.');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify_phone_otp.php', {
        phone: phone.trim(),
        code: code.trim(),
        user_id: userId,
      });
      setMessage(res.data?.message || 'Phone verified.');
      setTimeout(() => navigate('/login', { replace: true, state: { notice: 'Phone verified. You can sign in.' } }), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow" style={{ color: '#ffb703', marginBottom: '0.75rem' }}>
          ABUAD Market Place
        </p>
        <h1>Verify phone</h1>
        <p className="auth-subtitle">
          We will send a 6-digit code by SMS to confirm your number.
        </p>

        {message && <div className="auth-alert auth-alert-success">{message}</div>}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label htmlFor="sms_phone">Phone number</label>
              <input
                id="sms_phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0803 000 0000"
                autoComplete="tel"
              />
            </div>
            <button type="submit" disabled={sending} className="auth-submit">
              {sending ? 'Sending…' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="auth-subtitle" style={{ marginBottom: 0 }}>
              Code sent{hint ? ` to ${hint}` : ''}.
            </p>
            <div>
              <label htmlFor="sms_code">6-digit code</label>
              <input
                id="sms_code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                autoComplete="one-time-code"
              />
            </div>
            <button type="submit" disabled={verifying || code.length !== 6} className="auth-submit">
              {verifying ? 'Verifying…' : 'Verify phone'}
            </button>
            <button
              type="button"
              className="auth-secondary-btn"
              disabled={sending}
              onClick={sendOtp}
            >
              {sending ? 'Resending…' : 'Resend code'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyPhone;
