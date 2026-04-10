import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1"></div>
        <div className="auth-bg-orb orb-2"></div>
        <div className="auth-bg-orb orb-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#6c63ff"/>
              <path d="M8 16.5C8 12.358 11.358 9 15.5 9H24v2.5h-8.5C13.015 11.5 11 13.515 11 16.5S13.015 21.5 15.5 21.5H24V24h-8.5C11.358 24 8 20.642 8 16.5z" fill="white" opacity="0.9"/>
              <circle cx="22" cy="16.5" r="3" fill="white"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-brand-name">MoneyTracker</h1>
            <p className="auth-brand-tagline">Track. Plan. Grow.</p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>New to MoneyTracker?</span></div>
          <Link to="/register" className="btn btn-secondary auth-alt-btn">
            Create a free account
          </Link>
        </div>

        <div className="auth-stats">
          <div className="auth-stat">
            <span className="auth-stat-value">10K+</span>
            <span className="auth-stat-label">Users</span>
          </div>
          <div className="auth-stat-divider"></div>
          <div className="auth-stat">
            <span className="auth-stat-value">$2M+</span>
            <span className="auth-stat-label">Tracked</span>
          </div>
          <div className="auth-stat-divider"></div>
          <div className="auth-stat">
            <span className="auth-stat-value">99.9%</span>
            <span className="auth-stat-label">Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
