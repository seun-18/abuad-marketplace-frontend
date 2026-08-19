import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/errors';

const VerifyPhone = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const presetPhone = location.state?.phone || '';
  const userId = location.state?.user_id || null;

  const [phone, setPhone] = useState(presetPhone);
  const [code, setCode] = useState('');
  const [step, setStep] = useState(presetPhone ? 'code' : 'phone');
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
      setError(getErrorMessage(err, 'Could not send SMS.'));
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
      setTimeout(
        () =>
          navigate('/login', {
            replace: true,
            state: { notice: 'Phone verified. You can sign in.' },
          }),
        1000
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Verification failed.'));
    } finally {
      setVerifying(false);
    }
  };

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
            <p className="auth-kicker">Phone verification</p>
            <h1>Verify phone</h1>
            <p className="auth-subtitle">
              We will send a 6-digit code by SMS to confirm your number.
            </p>
          </header>

          {message ? <div className="auth-alert auth-alert-success">{message}</div> : null}
          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          {step === 'phone' ? (
            <form onSubmit={sendOtp} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="sms_phone">Phone number</label>
                <div className="auth-input-wrap">
                  <Phone size={17} aria-hidden="true" />
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
              </div>
              <button type="submit" disabled={sending} className="auth-submit">
                {sending ? (
                  'Sending…'
                ) : (
                  <>
                    Send code
                    <ArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="auth-form" noValidate>
              <p className="auth-subtitle" style={{ marginBottom: 0 }}>
                Code sent{hint ? ` to ${hint}` : ''}.
              </p>
              <div className="auth-field">
                <label htmlFor="sms_code">6-digit code</label>
                <div className="auth-input-wrap">
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
                    style={{ textAlign: 'center', letterSpacing: '0.25em', fontWeight: 600 }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="auth-submit"
              >
                {verifying ? 'Verifying…' : 'Verify phone'}
              </button>
              <button
                type="button"
                className="auth-secondary-btn"
                disabled={sending}
                onClick={sendOtp}
                style={{ alignSelf: 'center', color: 'var(--primary)' }}
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
    </div>
  );
};

export default VerifyPhone;
