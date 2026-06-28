import { apiClient } from './api';
import type { RequestItem, RequestCreate, RequestUpdate } from '@/types/request';

export const requestsService = {
  getById: async (id: string): Promise<RequestItem> => {
    const { data } = await apiClient.get<RequestItem>(`/requests/${id}`);
    return data;
  },

  create: async (payload: RequestCreate): Promise<RequestItem> => {
    const { data } = await apiClient.post<RequestItem>('/requests/', payload);
    return data;
  },

  update: async (id: string, payload: RequestUpdate): Promise<RequestItem> => {
    const { data } = await apiClient.put<RequestItem>(`/requests/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  duplicate: async (id: string): Promise<RequestItem> => {
    const { data } = await apiClient.post<RequestItem>(`/requests/${id}/duplicate`);
    return data;
  },

  move: async (id: string, collectionId: string, folderId: string | null): Promise<RequestItem> => {
    const { data } = await apiClient.patch<RequestItem>(`/requests/${id}/move`, {
      collection_id: collectionId,
      folder_id: folderId,
    });
    return data;
  },

  getFavorites: async (): Promise<RequestItem[]> => {
    const { data } = await apiClient.get<RequestItem[]>('/requests/favorites');
    return data;
  },
};
