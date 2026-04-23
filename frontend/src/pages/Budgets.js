import React, { useState, useEffect, useCallback } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../utils/api';
import './Budgets.css';

const EXPENSE_CATEGORIES = ['Housing','Food','Transport','Entertainment','Utilities','Healthcare','Education','Shopping','Other'];
const CATEGORY_ICONS = { Housing:'🏠',Food:'🍔',Transport:'🚗',Entertainment:'🎮',Utilities:'💡',Healthcare:'🏥',Education:'📚',Shopping:'🛍️',Other:'📦' };
const fmt = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const EMPTY_FORM = { category: 'Food', limit: '' };
const extractBudgets = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.budgets)) return payload.budgets;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.budgets)) return payload.data.budgets;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.budgets)) return payload.result.budgets;
  return [];
};

export default function Budgets({ month, year }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getBudgets(month, year);
      setBudgets(extractBudgets(data));
    } catch (e) {
      console.error(e);
      setBudgets([]);
      setError(e?.response?.data?.message || 'Failed to load budgets');
    }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        category: form.category,
        limit: Number(form.limit),
        month: Number(month),
        year: Number(year),
      };
      if (!payload.limit || payload.limit <= 0) {
        setError('Please enter a valid monthly limit.');
        return;
      }
      const res = await createBudget(payload);
      const saved = res?.data?.data || res?.data;
      if (saved && saved.category) {
        // Optimistic local update so user sees it instantly.
        setBudgets((prev) => {
          const prevList = Array.isArray(prev) ? prev : [];
          const idx = prevList.findIndex(
            (b) =>
              b.category === saved.category &&
              Number(b.month) === Number(saved.month ?? payload.month) &&
              Number(b.year) === Number(saved.year ?? payload.year)
          );
          if (idx >= 0) {
            const next = [...prevList];
            next[idx] = { ...next[idx], ...saved };
            return next;
          }
          return [...prevList, saved];
        });
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      await fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving budget');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try { await deleteBudget(id); fetchBudgets(); } catch (e) { console.error(e); }
  };

  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const totalBudget = safeBudgets.reduce((a, b) => a + Number(b.limit || 0), 0);
  const totalSpent = safeBudgets.reduce((a, b) => a + Number(b.spent || 0), 0);
  const overBudgetCount = safeBudgets.filter(b => Number(b.spent || 0) > Number(b.limit || 0)).length;

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Manage your spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setForm(EMPTY_FORM); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Set Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="budget-summary">
        <div className="budget-summary-card">
          <p className="budget-summary-label">Total Budget</p>
          <h3 className="budget-summary-value">{fmt(totalBudget)}</h3>
          <p className="budget-summary-sub">across {safeBudgets.length} categories</p>
        </div>
        <div className="budget-summary-card">
          <p className="budget-summary-label">Total Spent</p>
          <h3 className="budget-summary-value" style={{ color: totalSpent > totalBudget ? 'var(--accent-danger)' : 'var(--text-primary)' }}>{fmt(totalSpent)}</h3>
          <p className="budget-summary-sub">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}% of budget used</p>
        </div>
        <div className="budget-summary-card">
          <p className="budget-summary-label">Remaining</p>
          <h3 className="budget-summary-value" style={{ color: 'var(--accent-success)' }}>{fmt(Math.max(0, totalBudget - totalSpent))}</h3>
          <p className="budget-summary-sub">available to spend</p>
        </div>
        <div className="budget-summary-card">
          <p className="budget-summary-label">Over Budget</p>
          <h3 className="budget-summary-value" style={{ color: overBudgetCount > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>{overBudgetCount}</h3>
          <p className="budget-summary-sub">{overBudgetCount === 0 ? 'All on track! 🎉' : 'categories exceeded'}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : safeBudgets.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No budgets set</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Create budgets to track your spending limits</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create First Budget</button>
        </div>
      ) : (
        <div className="budgets-grid">
          {safeBudgets.map((budget) => {
            const spent = budget.spent || 0;
            const pct = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;
            const barColor = pct < 70 ? '#2ecc71' : pct < 90 ? '#f39c12' : '#e74c3c';

            return (
              <div key={budget._id} className={`budget-card card ${isOver ? 'over-budget' : ''}`}>
                <div className="budget-card-header">
                  <div className="budget-icon">{CATEGORY_ICONS[budget.category] || '📦'}</div>
                  <div className="budget-card-info">
                    <div className="budget-category">{budget.category}</div>
                    {isOver && <span className="over-badge">Over Budget!</span>}
                  </div>
                  <button className="action-btn delete" onClick={() => handleDelete(budget._id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
                <div className="budget-amounts">
                  <span className="budget-spent">{fmt(spent)}</span>
                  <span className="budget-limit">/ {fmt(budget.limit)}</span>
                </div>
                <div className="progress-bar" style={{ height: '10px' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }}></div>
                </div>
                <div className="budget-footer">
                  <span style={{ color: barColor, fontWeight: 600, fontSize: '13px' }}>{pct.toFixed(0)}% used</span>
                  <span style={{ color: isOver ? 'var(--accent-danger)' : 'var(--accent-success)', fontSize: '13px', fontWeight: 600 }}>
                    {isOver ? `${fmt(spent - budget.limit)} over` : `${fmt(budget.limit - spent)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Set Budget</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Limit ($)</label>
                <input type="number" min="1" step="0.01" placeholder="500.00" value={form.limit}
                  onChange={e => setForm({ ...form, limit: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? <><span className="btn-spinner"></span>Saving...</> : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
