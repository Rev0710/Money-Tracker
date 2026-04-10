import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Settings.css';

export default function Settings() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const handleProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await axios.put('/api/auth/profile', form);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'PHP', 'SGD', 'INR', 'MXN'];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="card settings-card">
          <h3 className="settings-section-title">Profile Information</h3>
          <div className="avatar-section">
            <div className="settings-avatar">{getInitials(user?.name)}</div>
            <div>
              <p className="avatar-name">{user?.name}</p>
              <p className="avatar-email">{user?.email}</p>
              <span className="badge badge-primary" style={{ marginTop: '4px' }}>{user?.plan || 'Free'} Plan</span>
            </div>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="btn-spinner"></span>Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Stats */}
        <div className="settings-right">
          <div className="card settings-card">
            <h3 className="settings-section-title">Account Details</h3>
            <div className="account-info-list">
              <div className="account-info-item">
                <span className="account-info-label">Member Since</span>
                <span className="account-info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="account-info-item">
                <span className="account-info-label">Plan</span>
                <span className="account-info-value">{user?.plan || 'Free'}</span>
              </div>
              <div className="account-info-item">
                <span className="account-info-label">Currency</span>
                <span className="account-info-value">{user?.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          <div className="card settings-card">
            <h3 className="settings-section-title">Tech Stack</h3>
            <div className="tech-stack">
              {[
                { name: 'MongoDB Atlas', desc: 'Cloud Database', color: '#00ed64', icon: '🍃' },
                { name: 'Express.js', desc: 'Backend API', color: '#fff', icon: '⚡' },
                { name: 'React', desc: 'Frontend UI', color: '#61dafb', icon: '⚛️' },
                { name: 'Node.js', desc: 'Runtime', color: '#83cd29', icon: '🟢' },
              ].map((t, i) => (
                <div key={i} className="tech-item">
                  <div className="tech-icon">{t.icon}</div>
                  <div>
                    <div className="tech-name" style={{ color: t.color }}>{t.name}</div>
                    <div className="tech-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card settings-card danger-zone">
            <h3 className="settings-section-title" style={{ color: 'var(--accent-danger)' }}>Danger Zone</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Once you log out, you'll need to sign in again to access your account.
            </p>
            <button className="btn btn-danger" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
