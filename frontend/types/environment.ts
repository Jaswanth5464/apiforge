export interface Variable {
  id: string;
  environment_id: string;
  key: string;
  value: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variables: Variable[];
}

export interface EnvironmentCreate {
  name: string;
  description?: string | null;
}

export interface EnvironmentUpdate {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

export interface VariableCreate {
  key: string;
  value: string;
  description?: string | null;
  enabled?: boolean;
}

export interface VariableUpdate {
  key?: string;
  value?: string;
  description?: string | null;
  enabled?: boolean;
}

export interface BulkVariablesUpdate {
  variables: VariableCreate[];
}
