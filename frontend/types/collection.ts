import type { RequestItem } from './request';

export interface Folder {
  id: string;
  collection_id: string;
  parent_folder_id: string | null;
  name: string;
  order_idx: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  folders: Folder[];
}

export interface CollectionWithRequests extends Collection {
  requests: RequestItem[];
}

export interface CollectionCreate {
  name: string;
  description?: string | null;
}

export interface CollectionUpdate {
  name?: string;
  description?: string | null;
}

export interface FolderCreate {
  name: string;
  collection_id: string;
  parent_folder_id?: string | null;
  order_idx?: number;
}

export interface FolderUpdate {
  name?: string;
  parent_folder_id?: string | null;
  order_idx?: number;
}
