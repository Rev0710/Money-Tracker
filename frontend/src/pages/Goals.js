import React, { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../utils/api';
import './Goals.css';

const GOAL_CATEGORIES = ['Vacation','Emergency Fund','Home','Car','Education','Retirement','Other'];
const GOAL_ICONS = ['🎯','✈️','🏠','🚗','📚','💰','🌟','💎','🎮','🎸','🏋️','🌏'];
const fmt = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const EMPTY = { name: '', targetAmount: '', currentAmount: '', deadline: '', category: 'Other', icon: '🎯' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showContrib, setShowContrib] = useState(null);
  const [contribAmt, setContribAmt] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try { const { data } = await getGoals(); setGoals(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const openAdd = () => { setEditGoal(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (goal) => {
    setEditGoal(goal);
    setForm({
      name: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount,
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '', category: goal.category, icon: goal.icon || '🎯'
    });
    setError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      if (editGoal) await updateGoal(editGoal._id, form);
      else await createGoal(form);
      setShowModal(false); fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving goal');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await deleteGoal(id); fetchGoals(); } catch (e) { console.error(e); }
  };

  const handleContrib = async (goal) => {
    const amount = parseFloat(contribAmt);
    if (!amount || amount <= 0) return;
    try {
      await updateGoal(goal._id, { currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) });
      setShowContrib(null); setContribAmt(''); fetchGoals();
    } catch (e) { console.error(e); }
  };

  const totalSaved = goals.reduce((a, b) => a + b.currentAmount, 0);
  const totalTarget = goals.reduce((a, b) => a + b.targetAmount, 0);
  const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="goals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">Track your savings goals</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="goals-summary">
        {[
          { label: 'Total Saved', value: fmt(totalSaved), icon: '💰', color: '#2ecc71' },
          { label: 'Total Target', value: fmt(totalTarget), icon: '🎯', color: '#6c63ff' },
          { label: 'Goals Completed', value: completed, icon: '🏆', color: '#f39c12' },
          { label: 'Active Goals', value: goals.filter(g => g.status === 'active').length, icon: '⚡', color: '#4ecdc4' },
        ].map((s, i) => (
          <div key={i} className="goal-summary-card card">
            <div className="goal-summary-icon" style={{ fontSize: '24px' }}>{s.icon}</div>
            <div>
              <p className="budget-summary-label">{s.label}</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : goals.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No goals yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Set financial goals and track your progress</p>
          <button className="btn btn-primary" onClick={openAdd}>Create First Goal</button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const barColor = isComplete ? '#2ecc71' : pct > 70 ? '#f39c12' : '#6c63ff';
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div key={goal._id} className={`goal-card card ${isComplete ? 'goal-complete' : ''}`}>
                {isComplete && <div className="goal-complete-badge">✅ Completed!</div>}
                <div className="goal-card-header">
                  <div className="goal-emoji">{goal.icon || '🎯'}</div>
                  <div className="goal-card-info">
                    <div className="goal-card-name">{goal.name}</div>
                    <span className="badge badge-primary" style={{ fontSize: '11px' }}>{goal.category}</span>
                  </div>
                  <div className="goal-card-actions">
                    <button className="action-btn edit" onClick={() => openEdit(goal)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(goal._id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>

                <div className="goal-progress-info">
                  <span className="goal-current">{fmt(goal.currentAmount)}</span>
                  <span className="goal-target">of {fmt(goal.targetAmount)}</span>
                  <span className="goal-pct-badge" style={{ color: barColor }}>{pct.toFixed(0)}%</span>
                </div>

                <div className="progress-bar" style={{ height: '10px', margin: '10px 0' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)` }}></div>
                </div>

                <div className="goal-meta">
                  {daysLeft !== null && (
                    <span style={{ fontSize: '12px', color: daysLeft < 30 ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                    </span>
                  )}
                  {!isComplete && (
                    <button className="btn btn-primary btn-sm" onClick={() => { setShowContrib(goal._id); setContribAmt(''); }}>
                      + Add Funds
                    </button>
                  )}
                </div>

                {showContrib === goal._id && (
                  <div className="contrib-row">
                    <input type="number" min="1" step="0.01" placeholder="Amount" value={contribAmt}
                      onChange={e => setContribAmt(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm" onClick={() => handleContrib(goal)}>Add</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowContrib(null)}>Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editGoal ? 'Edit Goal' : 'New Goal'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {GOAL_ICONS.map(icon => (
                    <button key={icon} type="button" className={`icon-btn ${form.icon === icon ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, icon })}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Goal Name</label>
                <input type="text" placeholder="e.g. Vacation Fund" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount ($)</label>
                  <input type="number" min="1" step="0.01" placeholder="5000.00" value={form.targetAmount}
                    onChange={e => setForm({ ...form, targetAmount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Current Amount ($)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.currentAmount}
                    onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline (optional)</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="btn-spinner"></span>Saving...</> : (editGoal ? 'Update Goal' : 'Create Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
