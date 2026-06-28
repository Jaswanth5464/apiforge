import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Collection } from '@/types/collection';
import type { RequestItem } from '@/types/request';

interface CollectionState {
  collections: Collection[];
  requestsByCollection: Record<string, RequestItem[]>;
  expandedCollections: Set<string>;
  expandedFolders: Set<string>;

  setCollections: (collections: Collection[]) => void;
  setRequests: (collectionId: string, requests: RequestItem[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (collection: Collection) => void;
  removeCollection: (id: string) => void;
  addRequest: (collectionId: string, request: RequestItem) => void;
  updateRequest: (request: RequestItem) => void;
  removeRequest: (collectionId: string, requestId: string) => void;
  toggleCollection: (id: string) => void;
  toggleFolder: (id: string) => void;
}

export const useCollectionStore = create<CollectionState>()(
  devtools(
    (set) => ({
      collections: [],
      requestsByCollection: {},
      expandedCollections: new Set(),
      expandedFolders: new Set(),

      setCollections: (collections) => set({ collections }),

      setRequests: (collectionId, requests) =>
        set((s) => ({
          requestsByCollection: { ...s.requestsByCollection, [collectionId]: requests },
        })),

      addCollection: (collection) =>
        set((s) => ({ collections: [...s.collections, collection] })),

      updateCollection: (collection) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === collection.id ? collection : c)),
        })),

      removeCollection: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.requestsByCollection;
          return {
            collections: s.collections.filter((c) => c.id !== id),
            requestsByCollection: rest,
          };
        }),

      addRequest: (collectionId, request) =>
        set((s) => ({
          requestsByCollection: {
            ...s.requestsByCollection,
            [collectionId]: [...(s.requestsByCollection[collectionId] || []), request],
          },
        })),

      updateRequest: (request) =>
        set((s) => ({
          requestsByCollection: {
            ...s.requestsByCollection,
            [request.collection_id]: (s.requestsByCollection[request.collection_id] || []).map(
              (r) => (r.id === request.id ? request : r)
            ),
          },
        })),

      removeRequest: (collectionId, requestId) =>
        set((s) => ({
          requestsByCollection: {
            ...s.requestsByCollection,
            [collectionId]: (s.requestsByCollection[collectionId] || []).filter(
              (r) => r.id !== requestId
            ),
          },
        })),

      toggleCollection: (id) =>
        set((s) => {
          const next = new Set(s.expandedCollections);
          next.has(id) ? next.delete(id) : next.add(id);
          return { expandedCollections: next };
        }),

      toggleFolder: (id) =>
        set((s) => {
          const next = new Set(s.expandedFolders);
          next.has(id) ? next.delete(id) : next.add(id);
          return { expandedFolders: next };
        }),
    }),
    { name: 'collection-store' }
  )
);
