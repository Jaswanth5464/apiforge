import type { KeyValueItem, AuthData, BodyType, AuthType, HttpMethod } from './request';

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  params: KeyValueItem[];
  headers: KeyValueItem[];
  body_type: BodyType;
  body_content: string | null;
  auth_type: AuthType;
  auth_data: AuthData;
  status_code: number | null;
  response_time_ms: number | null;
  response_size_bytes: number | null;
  response_headers: Record<string, string> | null;
  response_body: string | null;
  error: string | null;
  timestamp: string;
}

export interface RunRequest {
  method: HttpMethod;
  url: string;
  params: KeyValueItem[];
  headers: KeyValueItem[];
  body_type: BodyType;
  body_content: string | null;
  auth_type: AuthType;
  auth_data: AuthData;
  environment_id: string | null;
  timeout?: number;
  follow_redirects?: boolean;
}

export interface RunResponse {
  status_code: number;
  status_text: string;
  headers: Record<string, string>;
  body: string;
  response_time_ms: number;
  response_size_bytes: number;
  content_type: string;
  error: string | null;
  history_id: string | null;
}

export interface Tab {
  id: string;
  request_id: string | null;
  title: string;
  method: HttpMethod;
  url: string;
  params: KeyValueItem[];
  headers: KeyValueItem[];
  body_type: BodyType;
  body_content: string | null;
  auth_type: AuthType;
  auth_data: AuthData;
  is_dirty: boolean;
  order_idx: number;
}
