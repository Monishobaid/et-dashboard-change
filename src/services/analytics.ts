import { Session } from '../types/api';
import { format } from 'date-fns';

export interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  totalCreditsUsed: number;
  averageMessagesPerSession: number;
  averageCreditsPerSession: number;
  userActionBreakdown: {
    likes: number;
    dislikes: number;
    noAction: number;
  };
  sessionEngagement: {
    likedSessions: number;
    dislikedSessions: number;
    neutralSessions: number;
    engagementRate: number;
  };
  toolUsageBreakdown: {
    [key: string]: number;
  };
  toolEfficiency: {
    [key: string]: {
      usage: number;
      averageCredits: number;
      successRate: number;
    };
  };
  modelUsageBreakdown: {
    [key: string]: number;
  };
  dailySessionsData: {
    labels: string[];
    data: number[];
  };
  creditsUsageByTool: {
    [key: string]: number;
  };
  sessionLengthDistribution: {
    labels: string[];
    data: number[];
  };
  reviewSentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  hourlyDistribution: {
    labels: string[];
    data: number[];
  };
  topQueries: {
    query: string;
    count: number;
  }[];
}

export class AnalyticsService {
  static processSessionData(sessions: Session[]): AnalyticsData {
    const totalSessions = sessions.length;
    const allMessages = sessions.flatMap(s => s.messages);
    const totalMessages = allMessages.length;
    const totalCreditsUsed = allMessages.reduce((sum, msg) => sum + msg.creditsUsed, 0);

    const userActions = allMessages.reduce((acc, msg) => {
      if (msg.userAction === 'like') acc.likes++;
      else if (msg.userAction === 'dislike') acc.dislikes++;
      else acc.noAction++;
      return acc;
    }, { likes: 0, dislikes: 0, noAction: 0 });

    // Session-level engagement analysis
    const sessionEngagement = sessions.reduce((acc, session) => {
      const hasLikes = session.messages.some(msg => msg.userAction === 'like');
      const hasDislikes = session.messages.some(msg => msg.userAction === 'dislike');
      
      if (hasLikes && !hasDislikes) acc.likedSessions++;
      else if (hasDislikes && !hasLikes) acc.dislikedSessions++;
      else acc.neutralSessions++;
      
      return acc;
    }, { likedSessions: 0, dislikedSessions: 0, neutralSessions: 0, engagementRate: 0 });
    
    sessionEngagement.engagementRate = ((sessionEngagement.likedSessions + sessionEngagement.dislikedSessions) / totalSessions) * 100;

    const toolUsage = allMessages.reduce((acc: { [key: string]: number }, msg) => {
      acc[msg.toolUsed] = (acc[msg.toolUsed] || 0) + 1;
      return acc;
    }, {});

    // Tool efficiency analysis
    const toolEfficiency = Object.keys(toolUsage).reduce((acc: { [key: string]: any }, tool) => {
      const toolMessages = allMessages.filter(msg => msg.toolUsed === tool);
      const totalCredits = toolMessages.reduce((sum, msg) => sum + msg.creditsUsed, 0);
      const likes = toolMessages.filter(msg => msg.userAction === 'like').length;
      
      acc[tool] = {
        usage: toolMessages.length,
        averageCredits: totalCredits / toolMessages.length,
        successRate: (likes / toolMessages.length) * 100
      };
      return acc;
    }, {});

    const modelUsage = allMessages.reduce((acc: { [key: string]: number }, msg) => {
      acc[msg.modelUsed] = (acc[msg.modelUsed] || 0) + 1;
      return acc;
    }, {});

    const creditsUsageByTool = allMessages.reduce((acc: { [key: string]: number }, msg) => {
      acc[msg.toolUsed] = (acc[msg.toolUsed] || 0) + msg.creditsUsed;
      return acc;
    }, {});

    const dailySessions = sessions.reduce((acc: { [key: string]: number }, session) => {
      const date = format(new Date(session.createdAt * 1000), 'MMM dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Hourly distribution
    const hourlyData = allMessages.reduce((acc: { [key: string]: number }, msg) => {
      const hour = format(new Date(msg.timestamp * 1000), 'HH:00');
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const sessionLengths = sessions.reduce((acc: { [key: string]: number }, session) => {
      const messageCount = session.messageCount;
      let bucket: string;
      if (messageCount === 1) bucket = '1 message';
      else if (messageCount <= 3) bucket = '2-3 messages';
      else if (messageCount <= 5) bucket = '4-5 messages';
      else bucket = '6+ messages';
      
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    const reviewSentiment = allMessages.reduce((acc, msg) => {
      if (msg.userReview) {
        const review = msg.userReview.toLowerCase();
        if (review.includes('good') || review.includes('great') || review.includes('excellent') || review.includes('perfect')) {
          acc.positive++;
        } else if (review.includes('bad') || review.includes('poor') || review.includes('not good') || review.includes('terrible')) {
          acc.negative++;
        } else {
          acc.neutral++;
        }
      }
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    // Top queries analysis
    const queryCount = allMessages.reduce((acc: { [key: string]: number }, msg) => {
      acc[msg.query] = (acc[msg.query] || 0) + 1;
      return acc;
    }, {});
    
    const topQueries = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    return {
      totalSessions,
      totalMessages,
      totalCreditsUsed,
      averageMessagesPerSession: totalMessages / totalSessions || 0,
      averageCreditsPerSession: totalCreditsUsed / totalSessions || 0,
      userActionBreakdown: userActions,
      sessionEngagement,
      toolUsageBreakdown: toolUsage,
      toolEfficiency,
      modelUsageBreakdown: modelUsage,
      dailySessionsData: {
        labels: Object.keys(dailySessions).sort(),
        data: Object.keys(dailySessions).sort().map(date => dailySessions[date])
      },
      creditsUsageByTool,
      sessionLengthDistribution: {
        labels: Object.keys(sessionLengths),
        data: Object.values(sessionLengths)
      },
      reviewSentiment,
      hourlyDistribution: {
        labels: Object.keys(hourlyData).sort(),
        data: Object.keys(hourlyData).sort().map(hour => hourlyData[hour])
      },
      topQueries
    };
  }
}