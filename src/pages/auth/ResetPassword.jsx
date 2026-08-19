import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/errors';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing reset token. Open the link from your email.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset_password.php', {
        token,
        password,
        confirm_password: confirm,
      });
      setMessage(res.data?.message || 'Password updated.');
      setTimeout(
        () =>
          navigate('/login', {
            replace: true,
            state: { notice: 'Password updated. Sign in.' },
          }),
        1200
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset password.'));
    } finally {
      setSubmitting(false);
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
            <p className="auth-kicker">Account recovery</p>
            <h1>Choose a new password</h1>
            <p className="auth-subtitle">Use at least 8 characters for your new password.</p>
          </header>

          {message ? <div className="auth-alert auth-alert-success">{message}</div> : null}
          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="new_password">New password</label>
              <div className="auth-input-wrap auth-password-field">
                <Lock size={17} aria-hidden="true" />
                <input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm_new_password">Confirm password</label>
              <div className="auth-input-wrap auth-password-field">
                <Lock size={17} aria-hidden="true" />
                <input
                  id="confirm_new_password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? (
                'Updating…'
              ) : (
                <>
                  Update password
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
