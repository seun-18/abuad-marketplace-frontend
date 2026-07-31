import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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
      setMessage(res.data?.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset email. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow" style={{ color: '#ffb703', marginBottom: '0.75rem' }}>ABUAD Market Place</p>
        <h1>Forgot password</h1>
        <p className="auth-subtitle">Enter your account email and we will send a reset link.</p>
        {message && <div className="auth-alert auth-alert-success">{message}</div>}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot_email">Email address</label>
            <input id="forgot_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <button type="submit" disabled={submitting} className="auth-submit">{submitting ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <p className="auth-footer"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
