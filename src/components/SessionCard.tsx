import React, { useState } from 'react';
import { Session } from '../types/api';
import { formatTimestamp } from '../utils/dateUtils';
import './SessionCard.css';

interface SessionCardProps {
  session: Session;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [showAllMessages, setShowAllMessages] = useState(false);
  const getActionClass = (action: string | null) => {
    switch (action) {
      case 'like': return 'action-like';
      case 'dislike': return 'action-dislike';
      default: return 'action-none';
    }
  };

  const getToolBadge = (tool: string) => {
    const getToolClass = (toolName: string) => {
      switch (toolName) {
        case 'direct_response': return 'tool-direct';
        case 'market_data': return 'tool-market';
        case 'screener': return 'tool-screener';
        default: return 'tool-default';
      }
    };
    
    return (
      <span className={`tool-badge ${getToolClass(tool)}`}>
        {tool.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const totalCredits = session.messages.reduce((sum, msg) => sum + msg.creditsUsed, 0);
  
  return (
    <div className="session-card compact">
      <div className="session-header-compact">
        <div className="session-title-row">
          <h3 className="session-title">{session.title}</h3>
          <div className="session-stats-inline">
            <span className="stat-chip positive">{session.likeCount} Likes</span>
            <span className="stat-chip negative">{session.dislikeCount} Dislikes</span>
            <span className="stat-chip neutral">{session.messageCount} Messages</span>
            <span className="stat-chip credits">{totalCredits} Credits</span>
          </div>
        </div>
        
        <div className="session-info-row">
          <span className="session-time">{formatTimestamp(session.createdAt)}</span>
          <span className="session-id-short">ID: {session.sessionId.slice(0, 8)}</span>
          <a href={session.sessionUrl} target="_blank" rel="noopener noreferrer" className="view-link">
            View →
          </a>
        </div>
      </div>

      <div className="messages-compact">
        {(showAllMessages ? session.messages : session.messages.slice(0, 2)).map((message, index) => (
          <div key={index} className="message-row">
            <div className="message-content-compact">
              <span className="query-compact">{message.query}</span>
              <div className="message-tags">
                {getToolBadge(message.toolUsed)}
                <span className={`action-compact ${getActionClass(message.userAction)}`}>
                  {message.userAction === 'like' ? 'LIKED' : message.userAction === 'dislike' ? 'DISLIKED' : 'NO ACTION'}
                </span>
                <span className="credits-compact">{message.creditsUsed} credits</span>
              </div>
            </div>
            {message.userReview && (
              <div className="review-compact">Review: {message.userReview}</div>
            )}
          </div>
        ))}
        
        {session.messageCount > 2 && (
          <button 
            className="more-messages-toggle"
            onClick={() => setShowAllMessages(!showAllMessages)}
          >
            {showAllMessages 
              ? 'Show less' 
              : `+${session.messageCount - 2} more messages`
            }
          </button>
        )}
      </div>
    </div>
  );
};