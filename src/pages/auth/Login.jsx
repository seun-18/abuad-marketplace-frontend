import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);

  const notice = location.state?.notice || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      const msg =
        data?.message ||
        err.message ||
        'Invalid email or password.';
      setError(msg);
      if (data?.data?.requires_verification || /verify your email/i.test(msg)) {
        setNeedsVerify(true);
      }
    } finally {
      setSubmitting(false);
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
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {needsVerify && (
          <p className="auth-field-hint" style={{ marginTop: '-0.25rem' }}>
            Open the link we emailed you, or register again if it expired.{' '}
            <Link to="/verify-email">Verification help</Link>
          </p>
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
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
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
