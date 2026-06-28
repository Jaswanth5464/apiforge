import { apiClient } from './api';
import type { Collection, CollectionCreate, CollectionUpdate, Folder, FolderCreate, FolderUpdate } from '@/types/collection';
import type { RequestItem } from '@/types/request';

export const collectionsService = {
  getAll: async (): Promise<Collection[]> => {
    const { data } = await apiClient.get<Collection[]>('/collections/');
    return data;
  },

  getById: async (id: string): Promise<Collection> => {
    const { data } = await apiClient.get<Collection>(`/collections/${id}`);
    return data;
  },

  create: async (payload: CollectionCreate): Promise<Collection> => {
    const { data } = await apiClient.post<Collection>('/collections/', payload);
    return data;
  },

  update: async (id: string, payload: CollectionUpdate): Promise<Collection> => {
    const { data } = await apiClient.put<Collection>(`/collections/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/${id}`);
  },

  getRequests: async (collectionId: string): Promise<RequestItem[]> => {
    const { data } = await apiClient.get<RequestItem[]>(`/collections/${collectionId}/requests`);
    return data;
  },

  search: async (query: string): Promise<{ collections: Collection[]; requests: RequestItem[] }> => {
    const { data } = await apiClient.get('/collections/search/query', { params: { q: query } });
    return data;
  },

  // Folder operations
  createFolder: async (collectionId: string, payload: FolderCreate): Promise<Folder> => {
    const { data } = await apiClient.post<Folder>(`/collections/${collectionId}/folders`, payload);
    return data;
  },

  updateFolder: async (folderId: string, payload: FolderUpdate): Promise<Folder> => {
    const { data } = await apiClient.put<Folder>(`/collections/folders/${folderId}`, payload);
    return data;
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    await apiClient.delete(`/collections/folders/${folderId}`);
  },
};
