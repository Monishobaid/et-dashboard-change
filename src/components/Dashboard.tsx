import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SessionCard } from './SessionCard';
import { sessionService } from '../services/api';
import { Session, Filters, SessionDataResponse } from '../types/api';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [searchUserIds, setSearchUserIds] = useState<string>('');
  const [searchSessionIds, setSearchSessionIds] = useState<string>('');
  const [searchEmailIds, setSearchEmailIds] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20
  });
  const [responseData, setResponseData] = useState<SessionDataResponse | null>(null);

  // Calculate session overview metrics
  const sessionOverview = useMemo(() => {
    if (!sessions.length) return null;
    
    const totalMessages = sessions.reduce((sum, session) => sum + session.messageCount, 0);
    const totalCredits = sessions.reduce((sum, session) => 
      sum + session.messages.reduce((msgSum, msg) => msgSum + msg.creditsUsed, 0), 0
    );
    const likedSessions = sessions.filter(session => 
      session.messages.some(msg => msg.userAction === 'like')
    ).length;
    const dislikedSessions = sessions.filter(session => 
      session.messages.some(msg => msg.userAction === 'dislike')
    ).length;
    const averageMessages = totalMessages / sessions.length;
    const averageCredits = totalCredits / sessions.length;
    
    return {
      totalSessions: sessions.length,
      totalMessages,
      totalCredits,
      likedSessions,
      dislikedSessions,
      averageMessages,
      averageCredits,
      engagementRate: ((likedSessions + dislikedSessions) / sessions.length) * 100
    };
  }, [sessions]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters = { ...filters };
      
      if (searchUserIds.trim()) {
        searchFilters.userIds = searchUserIds.split(',').map(id => id.trim()).filter(id => id);
      }
      
      if (searchSessionIds.trim()) {
        searchFilters.sessionIds = searchSessionIds.split(',').map(id => id.trim()).filter(id => id);
      }
      
      if (searchEmailIds.trim()) {
        searchFilters.emailIds = searchEmailIds.split(',').map(id => id.trim()).filter(id => id);
      }
      
      const data = await sessionService.fetchSessionData({
        filters: searchFilters,
        pagination
      });
      
      setResponseData(data);
      setSessions(data.sessions);
    } catch (err) {
      setError('Failed to fetch session data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, searchUserIds, searchSessionIds, searchEmailIds]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ET Markets AI Bot Sessions</h1>
        <p>Comprehensive session management and detailed conversation analysis</p>
      </header>

      {/* Compact Metrics Bar */}
      {sessionOverview && responseData && (
        <div className="metrics-bar">
          <div className="metric-chip">
            <span className="chip-value">{sessionOverview.totalSessions}</span>
            <span className="chip-label">Sessions</span>
          </div>
          <div className="metric-chip">
            <span className="chip-value">{sessionOverview.totalMessages}</span>
            <span className="chip-label">Messages</span>
          </div>
          <div className="metric-chip">
            <span className="chip-value">{sessionOverview.totalCredits}</span>
            <span className="chip-label">Credits</span>
          </div>
          <div className="metric-chip engagement">
            <span className="chip-value">{sessionOverview.engagementRate.toFixed(0)}%</span>
            <span className="chip-label">Engaged</span>
          </div>
          <div className="metric-chip liked">
            <span className="chip-value">{sessionOverview.likedSessions}</span>
            <span className="chip-label">Liked</span>
          </div>
          <div className="metric-chip disliked">
            <span className="chip-value">{sessionOverview.dislikedSessions}</span>
            <span className="chip-label">Disliked</span>
          </div>
          <div className="pagination-chip">
            <span>Page {responseData.pagination.page}/{responseData.pagination.totalPages} • {(responseData.pagination.totalCount || 0).toLocaleString()} total</span>
          </div>
        </div>
      )}

      {/* Compact Search & Filters */}
      <div className="filters-section compact">
        <div className="compact-search-row">
          <div className="search-inputs">
            <input
              type="text"
              placeholder="Search User IDs (comma-separated)"
              value={searchUserIds}
              onChange={(e) => setSearchUserIds(e.target.value)}
              className="compact-input"
            />
            <input
              type="text"
              placeholder="Search Session IDs (comma-separated)"
              value={searchSessionIds}
              onChange={(e) => setSearchSessionIds(e.target.value)}
              className="compact-input"
            />
            <input
              type="text"
              placeholder="Search Email IDs (comma-separated)"
              value={searchEmailIds}
              onChange={(e) => setSearchEmailIds(e.target.value)}
              className="compact-input"
            />
          </div>
          
          <div className="filter-checkboxes">
            <label className="compact-filter">
              <input
                type="checkbox"
                checked={filters.liked || false}
                onChange={(e) => handleFilterChange({ liked: e.target.checked || undefined })}
              />
              <span>Liked</span>
            </label>
            
            <label className="compact-filter">
              <input
                type="checkbox"
                checked={filters.disliked || false}
                onChange={(e) => handleFilterChange({ disliked: e.target.checked || undefined })}
              />
              <span>Disliked</span>
            </label>
            
            <label className="compact-filter">
              <input
                type="checkbox"
                checked={filters.userReviewed || false}
                onChange={(e) => handleFilterChange({ userReviewed: e.target.checked || undefined })}
              />
              <span>Reviewed</span>
            </label>
          </div>
          
          <div className="action-controls">
            <select 
              value={pagination.pageSize} 
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-compact"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            
            <button 
              onClick={fetchSessions} 
              className="search-button-compact"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading sessions...</div>
        </div>
      )}
      
      {error && (
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <div className="error-text">Error: {error}</div>
          <button onClick={fetchSessions} className="retry-button">Try Again</button>
        </div>
      )}

      {/* Sessions Results */}
      {!loading && !error && (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <SessionCard key={session.sessionId} session={session} />
          ))}
        </div>
      )}

      {responseData && responseData.pagination.totalPages && responseData.pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {pagination.page} of {responseData.pagination.totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === (responseData.pagination.totalPages || 1)}
          >
            Next
          </button>
        </div>
      )}

      {sessions.length === 0 && !loading && !error && (
        <div className="no-sessions-state">
          <div className="no-sessions-icon">🔍</div>
          <div className="no-sessions-text">
            <h3>No sessions found</h3>
            <p>Try adjusting your search criteria or filters to find relevant sessions.</p>
          </div>
          <button onClick={() => {
            setSearchUserIds('');
            setSearchSessionIds('');
            setSearchEmailIds('');
            setFilters({});
          }} className="reset-filters-button">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};