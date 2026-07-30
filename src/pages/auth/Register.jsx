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
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Join the campus marketplace as a shopper or open your own store.
        </p>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition ${
                  formData.role === 'customer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Shop as a Customer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'vendor' })}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition ${
                  formData.role === 'vendor'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Sell as a Vendor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                required
                minLength={2}
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                required
                minLength={2}
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              aria-label="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              required
              minLength={10}
              aria-label="Phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {formData.role === 'vendor' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                name="shop_name"
                aria-label="Shop name"
                value={formData.shop_name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave blank to use "{formData.first_name || 'Your name'}'s Shop" — new stores need
                admin approval before going live.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Confirm
              </label>
              <input
                type="password"
                name="confirm_password"
                required
                minLength={8}
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:bg-gray-400 shadow-md"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
