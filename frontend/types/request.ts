export interface KeyValueItem {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

export interface AuthData {
  token?: string;
  username?: string;
  password?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type BodyType = 'none' | 'raw' | 'json' | 'text' | 'xml' | 'form-data' | 'x-www-form-urlencoded';
export type AuthType = 'none' | 'bearer' | 'basic';

export interface RequestItem {
  id: string;
  collection_id: string;
  folder_id: string | null;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValueItem[];
  headers: KeyValueItem[];
  body_type: BodyType;
  body_content: string | null;
  auth_type: AuthType;
  auth_data: AuthData;
  description: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequestCreate {
  collection_id: string;
  folder_id?: string | null;
  name: string;
  method: HttpMethod;
  url: string;
  params?: KeyValueItem[];
  headers?: KeyValueItem[];
  body_type?: BodyType;
  body_content?: string | null;
  auth_type?: AuthType;
  auth_data?: AuthData;
  description?: string | null;
}

export interface RequestUpdate {
  folder_id?: string | null;
  name?: string;
  method?: HttpMethod;
  url?: string;
  params?: KeyValueItem[];
  headers?: KeyValueItem[];
  body_type?: BodyType;
  body_content?: string | null;
  auth_type?: AuthType;
  auth_data?: AuthData;
  description?: string | null;
  is_favorite?: boolean;
}
