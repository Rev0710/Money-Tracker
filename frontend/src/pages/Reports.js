import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { getSummary, getTransactions } from '../utils/api';
import './Reports.css';

const COLORS = ['#6c63ff','#4ecdc4','#f39c12','#e74c3c','#a29bfe','#fd79a8','#00b894'];
const fmt = (v) => `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
        <p style={{ fontWeight: 700, marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>)}
      </div>
    );
  }
  return null;
};

export default function Reports({ month, year }) {
  const [summary, setSummary] = useState(null);
  const [allTx, setAllTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        getSummary(month, year),
        getTransactions({ month, year, limit: 100 })
      ]);
      const nextSummary = sumRes?.data?.data || sumRes?.data;
      const nextTx = txRes?.data?.data || txRes?.data;
      setSummary(nextSummary || null);
      setAllTx(Array.isArray(nextTx?.transactions) ? nextTx.transactions : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!summary) return null;

  const spendingByCategory = Array.isArray(summary.spendingByCategory) ? summary.spendingByCategory : [];
  const spendingTotal = spendingByCategory.reduce((a, b) => a + Number(b.total || 0), 0);

  // Daily spending data for line chart
  const dailyMap = {};
  (Array.isArray(allTx) ? allTx : []).filter(t => t.type === 'expense').forEach(t => {
    const d = new Date(t.date).getDate();
    dailyMap[d] = (dailyMap[d] || 0) + t.amount;
  });
  const dailyData = Object.entries(dailyMap).sort((a, b) => a[0] - b[0]).map(([day, amount]) => ({ day: `Day ${day}`, amount }));

  const safeAllTx = Array.isArray(allTx) ? allTx : [];
  const incomeTransactions = safeAllTx.filter(t => t.type === 'income');
  const expenseTransactions = safeAllTx.filter(t => t.type === 'expense');

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial insights and analytics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="report-metrics">
        {[
          { label: 'Net Cash Flow', value: summary.income - summary.expenses, color: summary.income >= summary.expenses ? '#2ecc71' : '#e74c3c' },
          { label: 'Savings Rate', value: `${summary.income > 0 ? ((summary.savings / summary.income) * 100).toFixed(1) : 0}%`, color: '#6c63ff', isText: true },
          { label: 'Avg Daily Spend', value: summary.expenses / 30, color: '#f39c12' },
          { label: 'Transactions', value: allTx.length, color: '#4ecdc4', isText: true },
        ].map((m, i) => (
          <div key={i} className="metric-card card">
            <p className="metric-label">{m.label}</p>
            <h3 className="metric-value" style={{ color: m.color }}>
              {m.isText ? m.value : fmt(m.value)}
            </h3>
          </div>
        ))}
      </div>

      <div className="reports-grid">
        {/* Cash Flow */}
        <div className="card report-card-wide">
          <div className="card-header">
            <h3 className="card-title">Monthly Cash Flow</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary.cashFlow} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '13px', color: 'var(--text-secondary)' }} />
              <Bar dataKey="income" name="Income" fill="#2ecc71" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending Breakdown</h3>
          </div>
          {summary.spendingByCategory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No spending data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={spendingByCategory.map(s => ({ name: s._id, value: s.total }))}
                    cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                    {spendingByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {spendingByCategory.map((s, i) => (
                  <div key={i} className="pie-legend-item">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }}></div>
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)' }}>{s._id}</span>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{fmt(s.total)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: 38, textAlign: 'right' }}>
                      {((s.total / spendingTotal) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Daily Spending Line */}
        <div className="card report-card-wide">
          <div className="card-header">
            <h3 className="card-title">Daily Spending Pattern</h3>
            <span className="card-tag">{allTx.filter(t => t.type === 'expense').length} expense transactions</span>
          </div>
          {dailyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No expense data this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v) => [fmt(v), 'Spent']} />
                <Line type="monotone" dataKey="amount" stroke="#6c63ff" strokeWidth={2.5} dot={{ fill: '#6c63ff', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Income vs Expense Summary */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Summary</h3></div>
          <div className="summary-rows">
            <div className="summary-row">
              <span className="summary-row-label">💰 Total Income</span>
              <span className="summary-row-value" style={{ color: '#2ecc71' }}>{fmt(summary.income)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row-label">💸 Total Expenses</span>
              <span className="summary-row-value" style={{ color: '#e74c3c' }}>{fmt(summary.expenses)}</span>
            </div>
            <div className="summary-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
              <span className="summary-row-label" style={{ fontWeight: 700 }}>📊 Net Savings</span>
              <span className="summary-row-value" style={{ color: summary.savings >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 800, fontSize: '18px' }}>
                {summary.savings >= 0 ? '+' : '-'}{fmt(summary.savings)}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-row-label">📈 Income Transactions</span>
              <span className="summary-row-value">{incomeTransactions.length}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row-label">📉 Expense Transactions</span>
              <span className="summary-row-value">{expenseTransactions.length}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row-label">🏆 Top Category</span>
              <span className="summary-row-value">{summary.spendingByCategory[0]?._id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
