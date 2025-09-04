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

  const getModelBadge = (model: string) => {
    const getModelClass = (modelName: string) => {
      if (modelName.includes('gpt')) return 'model-gpt';
      if (modelName.includes('gemini')) return 'model-gemini';
      if (modelName.includes('claude')) return 'model-claude';
      return 'model-default';
    };
    
    const getModelDisplay = (modelName: string) => {
      // Clean up model names for display
      return modelName
        .replace('gpt-4.1-mini', 'GPT-4.1 Mini')
        .replace('gemini-2.5-pro', 'Gemini 2.5 Pro')
        .replace(/^(gpt|gemini|claude)-?/i, (match, prefix) => 
          prefix.toUpperCase() + ' '
        );
    };
    
    return (
      <span className={`model-badge ${getModelClass(model)}`}>
        {getModelDisplay(model)}
      </span>
    );
  };

  const totalCredits = session.messages.reduce((sum, msg) => sum + msg.creditsUsed, 0);
  const totalCost = session.messages.reduce((sum, msg) => sum + msg.totalCostInr, 0);
  
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
            <span className="stat-chip cost">₹{(totalCost / 100).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="session-info-row">
          <span className="session-time">{formatTimestamp(session.createdAt)}</span>
          <span className="session-email">{session.emailId}</span>
          <span className="session-id">Session ID: {session.sessionId}</span>
          <span className="session-user-id">User ID: {session.userId}</span>
          {session.ssoID && <span className="session-sso">SSO: {session.ssoID}</span>}
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
                {getModelBadge(message.modelUsed)}
                <span className={`action-compact ${getActionClass(message.userAction)}`}>
                  {message.userAction === 'like' ? 'LIKED' : message.userAction === 'dislike' ? 'DISLIKED' : 'NO ACTION'}
                </span>
                <span className="credits-compact">{message.creditsUsed} credits</span>
                <span className="cost-compact">₹{(message.totalCostInr / 100).toFixed(2)}</span>
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