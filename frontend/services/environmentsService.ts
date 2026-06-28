import { apiClient } from './api';
import type { Environment, EnvironmentCreate, EnvironmentUpdate, Variable, VariableCreate, VariableUpdate, BulkVariablesUpdate } from '@/types/environment';

export const environmentsService = {
  getAll: async (): Promise<Environment[]> => {
    const { data } = await apiClient.get<Environment[]>('/environments/');
    return data;
  },

  getById: async (id: string): Promise<Environment> => {
    const { data } = await apiClient.get<Environment>(`/environments/${id}`);
    return data;
  },

  create: async (payload: EnvironmentCreate): Promise<Environment> => {
    const { data } = await apiClient.post<Environment>('/environments/', payload);
    return data;
  },

  update: async (id: string, payload: EnvironmentUpdate): Promise<Environment> => {
    const { data } = await apiClient.put<Environment>(`/environments/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/environments/${id}`);
  },

  activate: async (id: string): Promise<Environment> => {
    const { data } = await apiClient.post<Environment>(`/environments/${id}/activate`);
    return data;
  },

  addVariable: async (envId: string, payload: VariableCreate): Promise<Variable> => {
    const { data } = await apiClient.post<Variable>(`/environments/${envId}/variables`, payload);
    return data;
  },

  bulkUpdateVariables: async (envId: string, payload: BulkVariablesUpdate): Promise<Variable[]> => {
    const { data } = await apiClient.put<Variable[]>(`/environments/${envId}/variables/bulk`, payload);
    return data;
  },

  updateVariable: async (variableId: string, payload: VariableUpdate): Promise<Variable> => {
    const { data } = await apiClient.put<Variable>(`/environments/variables/${variableId}`, payload);
    return data;
  },

  deleteVariable: async (variableId: string): Promise<void> => {
    await apiClient.delete(`/environments/variables/${variableId}`);
  },
};
