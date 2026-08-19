import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Store,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errors';

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

  const passwordHint = useMemo(() => {
    const p = formData.password;
    if (!p) return '';
    if (p.length < 8) return 'Use at least 8 characters';
    if (!/[0-9]/.test(p) || !/[a-zA-Z]/.test(p)) return 'Mix letters and numbers for a stronger password';
    return 'Looks good';
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const setRole = (role) => {
    setFormData((c) => ({ ...c, role }));
    if (error) setError('');
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
    if (formData.role === 'vendor' && formData.shop_name.trim() && formData.shop_name.trim().length < 2) {
      setError('Shop name must be at least 2 characters.');
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
        setError(Array.isArray(first) ? String(first[0]) : String(first));
      } else {
        setError(getErrorMessage(err, 'Registration failed. Please try again.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap auth-wrap-wide">
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
            <p className="auth-kicker">Join ABUAD Market</p>
            <h1>Create account</h1>
            <p className="auth-subtitle">
              Shop as a customer or open a campus store. Vendors need a quick admin review before going live.
            </p>
          </header>

          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-role-row" role="group" aria-label="Account type">
              <button
                type="button"
                className={`auth-role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
              >
                <ShoppingBag size={16} aria-hidden="true" />
                <span>
                  <strong>Customer</strong>
                  <small>Buy on campus</small>
                </span>
              </button>
              <button
                type="button"
                className={`auth-role-btn ${formData.role === 'vendor' ? 'active' : ''}`}
                onClick={() => setRole('vendor')}
              >
                <Store size={16} aria-hidden="true" />
                <span>
                  <strong>Vendor</strong>
                  <small>Sell products</small>
                </span>
              </button>
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label htmlFor="first_name">First name</label>
                <div className="auth-input-wrap">
                  <User size={17} aria-hidden="true" />
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
              </div>
              <div className="auth-field">
                <label htmlFor="last_name">Last name</label>
                <div className="auth-input-wrap">
                  <User size={17} aria-hidden="true" />
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
            </div>

            <div className="auth-field">
              <label htmlFor="reg_email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
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
            </div>

            <div className="auth-field">
              <label htmlFor="phone">Phone number</label>
              <div className="auth-input-wrap">
                <Phone size={17} aria-hidden="true" />
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
            </div>

            {formData.role === 'vendor' ? (
              <div className="auth-field">
                <label htmlFor="shop_name">Shop name</label>
                <div className="auth-input-wrap">
                  <Store size={17} aria-hidden="true" />
                  <input
                    id="shop_name"
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleChange}
                    placeholder={`${formData.first_name || 'Your'}'s Shop`}
                  />
                </div>
                <p className="auth-field-hint">Optional — new stores need admin approval before going live.</p>
              </div>
            ) : null}

            <div className="auth-field">
              <label htmlFor="reg_password">Password</label>
              <div className="auth-input-wrap auth-password-field">
                <Lock size={17} aria-hidden="true" />
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
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordHint ? (
                <p
                  className={`auth-field-hint ${
                    passwordHint === 'Looks good' ? 'auth-field-hint-ok' : ''
                  }`}
                >
                  {passwordHint}
                </p>
              ) : null}
            </div>

            <div className="auth-field">
              <label htmlFor="confirm_password">Confirm password</label>
              <div className="auth-input-wrap auth-password-field">
                <Lock size={17} aria-hidden="true" />
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
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? (
                'Creating account…'
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
