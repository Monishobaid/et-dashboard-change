import React from 'react';
import './Navigation.css';

interface NavigationProps {
  activeView: 'sessions' | 'analytics';
  onViewChange: (view: 'sessions' | 'analytics') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-logo">
            <span className="brand-et">ET</span>
            <span className="brand-markets">Markets</span>
          </div>
          <span className="brand-subtitle">AI Bot Analytics</span>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${activeView === 'sessions' ? 'active' : ''}`}
            onClick={() => onViewChange('sessions')}
          >
            Sessions
          </button>
          <button
            className={`nav-link ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => onViewChange('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>
    </nav>
  );
};