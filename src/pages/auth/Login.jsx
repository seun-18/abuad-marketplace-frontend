import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/errors';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);

  const notice = location.state?.notice || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setNeedsVerify(false);
    setSubmitting(true);

    try {
      const user = await login(formData);

      switch (user.role) {
        case 'super_admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'vendor':
          navigate('/vendor/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;
      const msg = getErrorMessage(err, 'Invalid email or password.');
      setError(msg);
      if (data?.data?.requires_verification || /verify your email/i.test(msg)) {
        setNeedsVerify(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    if (!formData.email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setResending(true);
    setError('');
    setInfo('');
    try {
      const res = await api.post('/auth/resend_verification.php', {
        email: formData.email.trim(),
      });
      setInfo(res.data?.message || 'Verification email sent. Check inbox and spam.');
      if (res.data?.data?.already_verified) {
        setNeedsVerify(false);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send verification email. Please try again.'));
    } finally {
      setResending(false);
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
            <p className="auth-kicker">Welcome back</p>
            <h1>Sign in</h1>
            <p className="auth-subtitle">
              Shop campus deals, chat with sellers, or manage your store.
            </p>
          </header>

          {notice ? <div className="auth-alert auth-alert-success">{notice}</div> : null}
          {info ? <div className="auth-alert auth-alert-success">{info}</div> : null}
          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          {needsVerify ? (
            <div className="auth-alert auth-alert-warn">
              <p>Your account exists but email is not verified yet.</p>
              <button
                type="button"
                className="auth-secondary-btn"
                disabled={resending}
                onClick={resendVerification}
              >
                {resending ? 'Sending…' : 'Resend verification email'}
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrap auth-password-field">
                <Lock size={17} aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
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

            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? (
                'Signing in…'
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="auth-trust">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Secure login · Your data stays private</span>
          </div>

          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
