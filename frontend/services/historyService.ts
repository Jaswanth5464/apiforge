import { apiClient } from './api';
import type { HistoryEntry } from '@/types/runner';

export const historyService = {
  getAll: async (limit = 100): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get<HistoryEntry[]>('/history/', { params: { limit } });
    return data;
  },

  getById: async (id: string): Promise<HistoryEntry> => {
    const { data } = await apiClient.get<HistoryEntry>(`/history/${id}`);
    return data;
  },

  search: async (query: string): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get<HistoryEntry[]>('/history/search', { params: { q: query } });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/history/${id}`);
  },

  clearAll: async (): Promise<{ deleted: number }> => {
    const { data } = await apiClient.delete<{ deleted: number }>('/history/');
    return data;
  },
};
