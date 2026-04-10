import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getSummary, getTransactions, getGoals } from '../utils/api';
import './Dashboard.css';

const COLORS = ['#6c63ff','#4ecdc4','#f39c12','#e74c3c','#a29bfe','#fd79a8','#00b894'];
const CATEGORY_ICONS = {
  Housing: '🏠', Food: '🍔', Transport: '🚗', Entertainment: '🎮',
  Utilities: '💡', Healthcare: '🏥', Education: '📚', Shopping: '🛍️',
  Salary: '💼', Freelance: '💻', Investment: '📈', Other: '📦'
};

const formatCurrency = (val) => `$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatCard = ({ label, value, change, changeType, icon, color }) => (
  <div className="stat-card">
    <div className="stat-card-top">
      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{formatCurrency(value)}</h3>
      </div>
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
    </div>
    {change !== undefined && (
      <div className={`stat-change ${changeType === 'up' ? 'positive' : 'negative'}`}>
        <span>{changeType === 'up' ? '▲' : '▼'}</span>
        <span>{Math.abs(change).toFixed(1)}% from last month</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ month, year }) {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, txRes, goalsRes] = await Promise.all([
          getSummary(month, year),
          getTransactions({ month, year, limit: 5 }),
          getGoals()
        ]);
        setSummary(summaryRes.data);
        setRecentTransactions(txRes.data.transactions);
        setGoals(goalsRes.data.slice(0, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!summary) return null;

  const spendingTotal = summary.spendingByCategory.reduce((a, b) => a + b.total, 0);

  const quickInsights = [
    { icon: '📉', color: '#4ecdc4', text: `Your highest expense was ${summary.spendingByCategory[0]?._id || 'N/A'} (${((summary.spendingByCategory[0]?.total || 0) / (spendingTotal || 1) * 100).toFixed(1)}%).` },
    { icon: '💰', color: '#6c63ff', text: `You saved ${formatCurrency(summary.savings)} this month.` },
    { icon: '🎯', color: '#f39c12', text: `You have ${goals.length} active saving goals.` },
  ];

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Total Balance" value={summary.totalBalance} changeType="up" change={8.4} color="#6c63ff"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} />
        <StatCard label="Income" value={summary.income} changeType="up" change={12.6} color="#2ecc71"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
        <StatCard label="Expenses" value={summary.expenses} changeType="down" change={3.7} color="#e74c3c"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>} />
        <StatCard label="Savings" value={summary.savings} changeType="up" change={15.3} color="#4ecdc4"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
      </div>

      <div className="dashboard-grid">
        {/* Spending Overview */}
        <div className="card spending-card">
          <div className="card-header">
            <h3 className="card-title">Spending Overview</h3>
            <span className="card-tag">This Month</span>
          </div>
          <div className="spending-content">
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={summary.spendingByCategory.map(s => ({ name: s._id, value: s.total }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {summary.spendingByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <span className="pie-total">{formatCurrency(spendingTotal)}</span>
                <span className="pie-label">Total</span>
              </div>
            </div>
            <div className="spending-legend">
              {summary.spendingByCategory.map((s, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-dot" style={{ background: COLORS[i % COLORS.length] }}></div>
                  <span className="legend-name">{CATEGORY_ICONS[s._id] || '📦'} {s._id}</span>
                  <span className="legend-amount">{formatCurrency(s.total)}</span>
                  <span className="legend-pct">{((s.total / spendingTotal) * 100).toFixed(1)}%</span>
                </div>
              ))}
              {summary.spendingByCategory.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                  No spending data this month
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="card cashflow-card">
          <div className="card-header">
            <h3 className="card-title">Cash Flow</h3>
            <span className="card-tag">Last 5 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.cashFlow} margin={{ top: 5, right: 0, left: 0, bottom: 5 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Income" fill="#2ecc71" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="chart-legend-item"><div className="chart-legend-dot" style={{ background: '#2ecc71' }}></div> Income</div>
            <div className="chart-legend-item"><div className="chart-legend-dot" style={{ background: '#e74c3c' }}></div> Expenses</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card transactions-card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <Link to="/transactions" className="card-link">View All →</Link>
          </div>
          <div className="tx-list">
            {recentTransactions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💸</span>
                <p>No transactions yet</p>
                <Link to="/transactions" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Add Transaction</Link>
              </div>
            ) : recentTransactions.map((tx) => (
              <div key={tx._id} className="tx-item">
                <div className="tx-icon">{CATEGORY_ICONS[tx.category] || '📦'}</div>
                <div className="tx-info">
                  <div className="tx-title">{tx.title}</div>
                  <div className="tx-meta">{tx.category} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div className={`tx-amount ${tx.type === 'income' ? 'income' : 'expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="card goals-card">
          <div className="card-header">
            <h3 className="card-title">Goals</h3>
            <Link to="/goals" className="card-link">View All →</Link>
          </div>
          <div className="goals-list">
            {goals.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎯</span>
                <p>No goals set yet</p>
                <Link to="/goals" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Set a Goal</Link>
              </div>
            ) : goals.map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal._id} className="goal-item">
                  <div className="goal-top">
                    <div className="goal-icon-wrap">{goal.icon || '🎯'}</div>
                    <div className="goal-info">
                      <div className="goal-name">{goal.name}</div>
                      {goal.deadline && (
                        <div className="goal-deadline">Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                      )}
                    </div>
                    <div className="goal-pct">{pct.toFixed(0)}%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-primary), #8b5cf6)' }}></div>
                  </div>
                  <div className="goal-amounts">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>of {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card insights-card">
          <div className="card-header">
            <h3 className="card-title">Quick Insights</h3>
          </div>
          <div className="insights-list">
            {quickInsights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-icon" style={{ background: `${ins.color}18`, color: ins.color }}>
                  {ins.icon}
                </div>
                <p className="insight-text">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
