import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

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
      const msg = data?.message || err.message || 'Invalid email or password.';
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
      setError(
        err.response?.data?.message ||
          'Could not send verification email. Brevo may still be misconfigured.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow" style={{ color: '#ffb703', marginBottom: '0.75rem' }}>
          ABUAD Market Place
        </p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to shop campus finds, manage your store, or continue where you left off.
        </p>

        {notice && <div className="auth-alert auth-alert-success">{notice}</div>}
        {info && <div className="auth-alert auth-alert-success">{info}</div>}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {needsVerify && (
          <div className="auth-alert" style={{ borderColor: 'rgba(255,183,3,0.35)' }}>
            <p style={{ margin: '0 0 0.5rem' }}>
              Your account exists but the email was never verified (the first email likely never sent).
            </p>
            <button
              type="button"
              className="auth-submit"
              style={{ marginTop: '0.25rem' }}
              disabled={resending}
              onClick={resendVerification}
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email">Email address</label>
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

          <div>
            <label htmlFor="password">Password</label>
            <div className="auth-password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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

          <div className="auth-forgot-row">
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
