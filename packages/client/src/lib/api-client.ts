import axios from 'axios';
import { config } from '../config';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  sendMessage: async (message: string) => {
    const response = await apiClient.post('/api/agent/chat', { message });
    return response.data;
  },
};
