import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';

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
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Missing reset token. Open the link from your email.'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset_password.php', { token, password, confirm_password: confirm });
      setMessage(res.data?.message || 'Password updated.');
      setTimeout(() => navigate('/login', { replace: true, state: { notice: 'Password updated. Sign in.' } }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow" style={{ color: '#ffb703', marginBottom: '0.75rem' }}>ABUAD Market Place</p>
        <h1>Choose a new password</h1>
        <p className="auth-subtitle">Use at least 8 characters for your new password.</p>
        {message && <div className="auth-alert auth-alert-success">{message}</div>}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new_password">New password</label>
            <div className="auth-password-field">
              <input id="new_password" type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm_new_password">Confirm password</label>
            <div className="auth-password-field">
              <input id="confirm_new_password" type={showConfirm ? 'text' : 'password'} required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle password">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" disabled={submitting || !token} className="auth-submit">{submitting ? 'Saving…' : 'Update password'}</button>
        </form>
        <p className="auth-footer"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;
