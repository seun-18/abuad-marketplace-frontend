import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/errors';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot_password.php', { email: email.trim() });
      setMessage(
        res.data?.message ||
          'If an account exists for that email, a reset link has been sent.'
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send reset email. Try again.'));
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
            <h1>Forgot password</h1>
            <p className="auth-subtitle">
              Enter your account email and we will send a reset link.
            </p>
          </header>

          {message ? <div className="auth-alert auth-alert-success">{message}</div> : null}
          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="forgot_email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="forgot_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? (
                'Sending…'
              ) : (
                <>
                  Send reset link
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

export default ForgotPassword;
