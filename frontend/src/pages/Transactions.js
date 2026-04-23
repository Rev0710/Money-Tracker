import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../utils/api';
import './Transactions.css';

const CATEGORIES = ['Housing','Food','Transport','Entertainment','Utilities','Healthcare','Education','Shopping','Salary','Freelance','Investment','Other'];
const CATEGORY_ICONS = { Housing:'🏠',Food:'🍔',Transport:'🚗',Entertainment:'🎮',Utilities:'💡',Healthcare:'🏥',Education:'📚',Shopping:'🛍️',Salary:'💼',Freelance:'💻',Investment:'📈',Other:'📦' };
const fmt = (v) => `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const EMPTY_FORM = { title: '', amount: '', type: 'expense', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] };

export default function Transactions({ month, year }) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getTransactions({ month, year, type: filterType, category: filterCategory, page, limit: 15 });
      const tx = Array.isArray(data?.transactions) ? data.transactions : (Array.isArray(data) ? data : (data?.data?.transactions || []));
      const totalVal = Number.isFinite(data?.total) ? data.total : Number(data?.data?.total || 0);
      setTransactions(Array.isArray(tx) ? tx : []);
      setTotal(Number.isFinite(totalVal) ? totalVal : 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month, year, filterType, filterCategory, page]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const openAdd = () => { setEditTx(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (tx) => {
    setEditTx(tx);
    setForm({ title: tx.title, amount: tx.amount, type: tx.type, category: tx.category, description: tx.description || '', date: tx.date.split('T')[0] });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editTx) await updateTransaction(editTx._id, form);
      else await createTransaction(form);
      setShowModal(false);
      fetchTx();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteTransaction(id); fetchTx(); } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{total} transactions found</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="tx-filters card">
        <div className="filter-group">
          <label>Type</label>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={() => { setFilterType(''); setFilterCategory(''); setPage(1); }}>
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="card tx-table-card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px' }}>
            <span style={{ fontSize: '48px' }}>💸</span>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '8px' }}>No transactions found</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openAdd}>Add Your First Transaction</button>
          </div>
        ) : (
          <>
            <div className="tx-table-header">
              <span>Transaction</span>
              <span>Category</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Actions</span>
            </div>
            {transactions.map(tx => (
              <div key={tx._id} className="tx-row">
                <div className="tx-row-main">
                  <div className="tx-row-icon">{CATEGORY_ICONS[tx.category] || '📦'}</div>
                  <div>
                    <div className="tx-row-title">{tx.title}</div>
                    {tx.description && <div className="tx-row-desc">{tx.description}</div>}
                  </div>
                </div>
                <div>
                  <span className="badge badge-primary">{tx.category}</span>
                </div>
                <div className="tx-row-date">
                  {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className={`tx-row-amount ${tx.type === 'income' ? 'income' : 'expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
                <div className="tx-row-actions">
                  <button className="action-btn edit" onClick={() => openEdit(tx)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(tx._id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editTx ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="e.g. Grocery Store" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={100} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea placeholder="Add a note..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} rows={2} maxLength={300} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="btn-spinner"></span>Saving...</> : (editTx ? 'Update' : 'Add Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
