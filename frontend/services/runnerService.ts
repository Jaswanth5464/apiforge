import { apiClient } from './api';
import type { RunRequest, RunResponse, Tab } from '@/types/runner';

export const runnerService = {
  run: async (payload: RunRequest): Promise<RunResponse> => {
    const { data } = await apiClient.post<RunResponse>('/runner/run', payload);
    return data;
  },
};

export const tabsService = {
  getAll: async (): Promise<Tab[]> => {
    const { data } = await apiClient.get<Tab[]>('/tabs/');
    return data;
  },

  create: async (payload: Partial<Tab>): Promise<Tab> => {
    const { data } = await apiClient.post<Tab>('/tabs/', payload);
    return data;
  },

  update: async (id: string, payload: Partial<Tab>): Promise<Tab> => {
    const { data } = await apiClient.put<Tab>(`/tabs/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tabs/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await apiClient.delete('/tabs/');
  },
};
