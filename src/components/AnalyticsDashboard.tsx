import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { sessionService } from '../services/api';
import { AnalyticsService, AnalyticsData } from '../services/analytics';
import { Session } from '../types/api';
import './AnalyticsDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const AnalyticsDashboard: React.FC = () => {
  const [, setAllSessions] = useState<Session[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get a large batch to see total count
      const initialData = await sessionService.fetchSessionData({
        filters: {},
        pagination: { page: 1, pageSize: 1000 }
      });
      
      let allSessions = [...initialData.sessions];
      
      // If there are more sessions, fetch them in batches
      if (initialData.pagination.hasMore && initialData.pagination.totalPages && initialData.pagination.totalPages > 1) {
        const totalPages = initialData.pagination.totalPages;
        const fetchPromises = [];
        
        // Fetch remaining pages in parallel
        for (let page = 2; page <= Math.min(totalPages, 10); page++) { // Limit to 10 pages max for performance
          fetchPromises.push(
            sessionService.fetchSessionData({
              filters: {},
              pagination: { page, pageSize: 1000 }
            })
          );
        }
        
        const additionalData = await Promise.all(fetchPromises);
        additionalData.forEach(data => {
          allSessions = allSessions.concat(data.sessions);
        });
      }
      
      setAllSessions(allSessions);
      const analyticsData = AnalyticsService.processSessionData(allSessions);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSessions();
  }, [fetchAllSessions]);

  if (loading) return <div className="analytics-loading">Loading comprehensive analytics...</div>;
  if (error) return <div className="analytics-error">Error: {error}</div>;
  if (!analytics) return null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 13, weight: 500 },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#c62828',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: '#f0f0f0', lineWidth: 1 },
        ticks: { color: '#4a4a4a', font: { size: 11 } },
      },
      y: {
        grid: { color: '#f0f0f0', lineWidth: 1 },
        ticks: { color: '#4a4a4a', font: { size: 11 } },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: 500 },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#c62828',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  // Session Engagement Data
  const sessionEngagementData = {
    labels: ['Liked Sessions', 'Disliked Sessions', 'Neutral Sessions'],
    datasets: [{
      data: [
        analytics.sessionEngagement.likedSessions,
        analytics.sessionEngagement.dislikedSessions,
        analytics.sessionEngagement.neutralSessions,
      ],
      backgroundColor: ['#2e7d32', '#c62828', '#757575'],
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverOffset: 8,
    }],
  };

  // Message Actions Data  
  const userActionChartData = {
    labels: ['Message Likes', 'Message Dislikes', 'No Action'],
    datasets: [{
      data: [
        analytics.userActionBreakdown.likes,
        analytics.userActionBreakdown.dislikes,
        analytics.userActionBreakdown.noAction,
      ],
      backgroundColor: ['#2e7d32', '#c62828', '#9e9e9e'],
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverOffset: 8,
    }],
  };

  const toolUsageChartData = {
    labels: Object.keys(analytics.toolUsageBreakdown).map(tool => 
      tool.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ),
    datasets: [{
      label: 'Usage Count',
      data: Object.values(analytics.toolUsageBreakdown),
      backgroundColor: '#1a1a1a',
      borderColor: '#333333',
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const dailySessionsChartData = {
    labels: analytics.dailySessionsData.labels,
    datasets: [{
      label: 'Sessions',
      data: analytics.dailySessionsData.data,
      borderColor: '#c62828',
      backgroundColor: 'rgba(198, 40, 40, 0.08)',
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: '#1a1a1a',
      pointBorderColor: '#c62828',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      fill: true,
    }],
  };

  const hourlyDistributionData = {
    labels: analytics.hourlyDistribution.labels,
    datasets: [{
      label: 'Messages per Hour',
      data: analytics.hourlyDistribution.data,
      backgroundColor: '#757575',
      borderColor: '#1a1a1a',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };


  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <h1>Comprehensive Analytics Dashboard</h1>
        <p>Deep insights into ET Markets AI Bot performance and user engagement</p>
      </header>

      {/* Enhanced Key Metrics */}
      <div className="metrics-overview">
        <div className="metrics-grid">
          <div className="metric-card primary">
            <h3>Total Sessions</h3>
            <div className="metric-value">{analytics.totalSessions.toLocaleString()}</div>
            <div className="metric-change">Active user sessions</div>
          </div>
          
          <div className="metric-card">
            <h3>Total Messages</h3>
            <div className="metric-value">{analytics.totalMessages.toLocaleString()}</div>
            <div className="metric-change">
              Avg: {analytics.averageMessagesPerSession.toFixed(1)} per session
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Credits Consumed</h3>
            <div className="metric-value">{analytics.totalCreditsUsed.toLocaleString()}</div>
            <div className="metric-change">
              Avg: {analytics.averageCreditsPerSession.toFixed(1)} per session
            </div>
          </div>
          
          <div className="metric-card success">
            <h3>Engagement Rate</h3>
            <div className="metric-value">{analytics.sessionEngagement.engagementRate.toFixed(1)}%</div>
            <div className="metric-change">Sessions with user feedback</div>
          </div>
        </div>
      </div>

      {/* Engagement Analysis Section */}
      <div className="section-header">
        <h2>User Engagement Analysis</h2>
        <p>How users interact with AI bot responses across sessions and messages</p>
      </div>

      <div className="engagement-grid">
        <div className="chart-card">
          <h3>Session-Level Engagement</h3>
          <div className="engagement-stats">
            <div className="engagement-stat liked">
              <span className="stat-number">{analytics.sessionEngagement.likedSessions}</span>
              <span className="stat-label">Liked Sessions</span>
            </div>
            <div className="engagement-stat disliked">
              <span className="stat-number">{analytics.sessionEngagement.dislikedSessions}</span>
              <span className="stat-label">Disliked Sessions</span>
            </div>
            <div className="engagement-stat neutral">
              <span className="stat-number">{analytics.sessionEngagement.neutralSessions}</span>
              <span className="stat-label">Neutral Sessions</span>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={sessionEngagementData} options={pieChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Message-Level Actions</h3>
          <div className="engagement-stats">
            <div className="engagement-stat liked">
              <span className="stat-number">{analytics.userActionBreakdown.likes}</span>
              <span className="stat-label">Message Likes</span>
            </div>
            <div className="engagement-stat disliked">
              <span className="stat-number">{analytics.userActionBreakdown.dislikes}</span>
              <span className="stat-label">Message Dislikes</span>
            </div>
            <div className="engagement-stat neutral">
              <span className="stat-number">{analytics.userActionBreakdown.noAction}</span>
              <span className="stat-label">No Action</span>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={userActionChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Usage Patterns Section */}
      <div className="section-header">
        <h2>Usage Patterns & Trends</h2>
        <p>Session activity and tool utilization patterns over time</p>
      </div>

      <div className="charts-grid">
        <div className="chart-card wide">
          <h3>Daily Session Activity</h3>
          <div className="chart-container">
            <Line data={dailySessionsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Hourly Message Distribution</h3>
          <div className="chart-container">
            <Bar data={hourlyDistributionData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Tool Usage Analysis</h3>
          <div className="chart-container">
            <Bar data={toolUsageChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Credits Consumption by Tool</h3>
          <div className="chart-container">
            <Bar 
              data={{
                labels: Object.keys(analytics.creditsUsageByTool).map(tool => 
                  tool.replace('_', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')
                ),
                datasets: [{
                  label: 'Credits Used',
                  data: Object.values(analytics.creditsUsageByTool),
                  backgroundColor: '#c62828',
                  borderColor: '#8e0000',
                  borderWidth: 1,
                  borderRadius: 4,
                }],
              }}
              options={chartOptions} 
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Session Length Distribution</h3>
          <div className="chart-container">
            <Pie 
              data={{
                labels: analytics.sessionLengthDistribution.labels,
                datasets: [{
                  data: analytics.sessionLengthDistribution.data,
                  backgroundColor: ['#1a1a1a', '#333333', '#757575', '#9e9e9e'],
                  borderWidth: 0,
                  hoverOffset: 4,
                }],
              }}
              options={pieChartOptions} 
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Model Performance</h3>
          <div className="chart-container">
            <Bar 
              data={{
                labels: Object.keys(analytics.modelUsageBreakdown),
                datasets: [{
                  label: 'Messages Count',
                  data: Object.values(analytics.modelUsageBreakdown),
                  backgroundColor: '#757575',
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                  borderRadius: 4,
                }]
              }} 
              options={chartOptions} 
            />
          </div>
        </div>
      </div>

      {/* Tool Efficiency Section */}
      <div className="section-header">
        <h2>Tool Efficiency Analysis</h2>
        <p>Performance metrics for each AI tool including success rates and cost efficiency</p>
      </div>

      <div className="tool-efficiency-grid">
        {Object.entries(analytics.toolEfficiency).map(([tool, data]) => (
          <div key={tool} className="efficiency-card">
            <h4>{tool.replace('_', ' ').toUpperCase()}</h4>
            <div className="efficiency-metrics">
              <div className="efficiency-metric">
                <span className="metric-label">Usage</span>
                <span className="metric-value">{data.usage}</span>
              </div>
              <div className="efficiency-metric">
                <span className="metric-label">Avg Credits</span>
                <span className="metric-value">{data.averageCredits.toFixed(1)}</span>
              </div>
              <div className="efficiency-metric">
                <span className="metric-label">Success Rate</span>
                <span className="metric-value">{data.successRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="efficiency-bar">
              <div 
                className="efficiency-fill" 
                style={{ width: `${data.successRate}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Queries Section */}
      <div className="section-header">
        <h2>Popular Queries</h2>
        <p>Most frequently asked questions by users</p>
      </div>

      <div className="queries-section">
        <div className="queries-list">
          {analytics.topQueries.slice(0, 8).map((query, index) => (
            <div key={index} className="query-item">
              <div className="query-rank">#{index + 1}</div>
              <div className="query-content">
                <div className="query-text">{query.query}</div>
                <div className="query-count">Asked {query.count} times</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Insights */}
      <div className="section-header">
        <h2>Key Performance Insights</h2>
        <p>Strategic insights derived from user interaction data</p>
      </div>

      <div className="insights-grid">
        <div className="insight-card engagement">
          <h4>Session Engagement</h4>
          <div className="insight-content">
            <div className="insight-stat">
              <span className="stat-value">{analytics.sessionEngagement.likedSessions}</span>
              <span className="stat-label">Positive Sessions</span>
            </div>
            <div className="insight-stat">
              <span className="stat-value">{analytics.sessionEngagement.dislikedSessions}</span>
              <span className="stat-label">Negative Sessions</span>
            </div>
          </div>
          <p>
            {analytics.sessionEngagement.engagementRate.toFixed(1)}% of sessions receive user feedback, 
            indicating strong user engagement with the AI bot.
          </p>
        </div>

        <div className="insight-card performance">
          <h4>Tool Performance</h4>
          <div className="insight-content">
            <div className="insight-stat">
              <span className="stat-value">
                {Object.entries(analytics.toolUsageBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'N/A'}
              </span>
              <span className="stat-label">Most Used Tool</span>
            </div>
            <div className="insight-stat">
              <span className="stat-value">
                {Object.entries(analytics.toolUsageBreakdown).sort(([,a], [,b]) => b - a)[0]?.[1] || 0}
              </span>
              <span className="stat-label">Usage Count</span>
            </div>
          </div>
          <p>
            Tool efficiency varies significantly. Focus on optimizing high-usage, 
            low-satisfaction tools for better user experience.
          </p>
        </div>

        <div className="insight-card cost">
          <h4>Cost Efficiency</h4>
          <div className="insight-content">
            <div className="insight-stat">
              <span className="stat-value">{(analytics.totalCreditsUsed / analytics.totalMessages).toFixed(2)}</span>
              <span className="stat-label">Credits per Message</span>
            </div>
            <div className="insight-stat">
              <span className="stat-value">{analytics.averageCreditsPerSession.toFixed(1)}</span>
              <span className="stat-label">Credits per Session</span>
            </div>
          </div>
          <p>
            Monitor credit consumption patterns to optimize cost efficiency 
            while maintaining response quality.
          </p>
        </div>

        <div className="insight-card sentiment">
          <h4>Review Sentiment</h4>
          <div className="insight-content">
            <div className="insight-stat">
              <span className="stat-value">{analytics.reviewSentiment.positive}</span>
              <span className="stat-label">Positive Reviews</span>
            </div>
            <div className="insight-stat">
              <span className="stat-value">{analytics.reviewSentiment.negative}</span>
              <span className="stat-label">Negative Reviews</span>
            </div>
          </div>
          <p>
            User reviews provide valuable feedback for improving AI responses 
            and overall service quality.
          </p>
        </div>
      </div>
    </div>
  );
};