import axios from 'axios';
import { SessionDataRequest, SessionDataResponse } from '../types/api';

const API_BASE_URL = 'https://etmarketsai.indiatimes.com/aibot';

export const sessionService = {
  async fetchSessionData(request: SessionDataRequest): Promise<SessionDataResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/session-data`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching session data:', error);
      throw error;
    }
  },
};