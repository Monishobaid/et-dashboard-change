import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import './styles/theme.css';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState<'sessions' | 'analytics'>('sessions');

  return (
    <div className="App">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="main-content">
        {activeView === 'sessions' ? <Dashboard /> : <AnalyticsDashboard />}
      </main>
    </div>
  );
}

export default App;
