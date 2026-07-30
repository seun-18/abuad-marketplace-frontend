import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'customer',
    shop_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      delete payload.confirm_password;
      const result = await register(payload);

      const notice =
        result.data?.role === 'vendor'
          ? 'Account created. Your vendor store is pending admin approval — you can log in now.'
          : 'Account created successfully. Please log in.';

      navigate('/login', { state: { notice } });
    } catch (err) {
      const apiErrors = err.response?.data?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const first = Object.values(apiErrors).flat?.() || Object.values(apiErrors);
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
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
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join as a shopper or open a campus store. Vendors need a quick admin review before going live.
        </p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="auth-role-row">
            <button
              type="button"
              className={`auth-role-btn ${formData.role === 'customer' ? 'active' : ''}`}
              onClick={() => setFormData((c) => ({ ...c, role: 'customer' }))}
            >
              Customer
            </button>
            <button
              type="button"
              className={`auth-role-btn ${formData.role === 'vendor' ? 'active' : ''}`}
              onClick={() => setFormData((c) => ({ ...c, role: 'vendor' }))}
            >
              Vendor
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                required
                minLength={2}
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="last_name">Last name</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                required
                minLength={2}
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg_email">Email address</label>
            <input
              id="reg_email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              required
              minLength={10}
              value={formData.phone}
              onChange={handleChange}
              placeholder="080…"
              autoComplete="tel"
            />
          </div>

          {formData.role === 'vendor' && (
            <div>
              <label htmlFor="shop_name">Shop name</label>
              <input
                id="shop_name"
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder={`${formData.first_name || 'Your'}'s Shop`}
              />
              <p className="auth-field-hint">Optional — new stores need admin approval before going live.</p>
            </div>
          )}

          <div>
            <label htmlFor="reg_password">Password</label>
            <div className="auth-password-field">
              <input
                id="reg_password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirm_password">Confirm password</label>
            <div className="auth-password-field">
              <input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                name="confirm_password"
                required
                minLength={8}
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
