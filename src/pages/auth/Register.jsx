import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        setError(Object.values(apiErrors).flat().join(' '));
      } else {
        setError(
          err.response?.data?.message || err.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '30rem' }}>
        <p className="eyebrow" style={{ color: '#ffb703', marginBottom: '0.75rem' }}>
          ABUAD Market Place
        </p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join as a shopper or open a campus store. Vendors go live after a quick admin review.
        </p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>I want to</label>
            <div className="auth-role-grid">
              <button
                type="button"
                className={`auth-role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'customer' })}
              >
                Shop as a customer
              </button>
              <button
                type="button"
                className={`auth-role-btn ${formData.role === 'vendor' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'vendor' })}
              >
                Sell as a vendor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.35rem' }}>
                Optional — new stores need admin approval before going live.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg_password">Password</label>
              <input
                id="reg_password"
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirm_password">Confirm</label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                required
                minLength={8}
                value={formData.confirm_password}
                onChange={handleChange}
              />
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
