import React from 'react';
import './TopBar.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function TopBar({ month, year, setMonth, setYear, user }) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const emoji = currentHour < 12 ? '☀️' : currentHour < 18 ? '👋' : '🌙';

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-greeting">
          <h2 className="topbar-greeting-text">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}! {emoji}
          </h2>
          <p className="topbar-subtitle">Here's your financial overview for {MONTHS[month - 1]} {year}.</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-month-picker">
          <button className="month-nav-btn" onClick={handlePrevMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="month-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {MONTHS[month - 1]} {year}
          </span>
          <button className="month-nav-btn" onClick={handleNextMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
