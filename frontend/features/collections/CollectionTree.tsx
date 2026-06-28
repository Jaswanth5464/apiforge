'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderPlus, ChevronRight, ChevronDown, Folder, FileText, MoreHorizontal, Star, Copy, Trash2, Edit2, FolderOpen } from 'lucide-react';
import { collectionsService } from '@/services/collectionsService';
import { requestsService } from '@/services/requestsService';
import { useCollectionStore } from '@/store/collectionStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { getMethodBadgeColor, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Collection, Folder as FolderType } from '@/types/collection';
import type { RequestItem } from '@/types/request';
import type { Tab } from '@/types/runner';

interface CollectionTreeProps {
  searchQuery: string;
}

export function CollectionTree({ searchQuery }: CollectionTreeProps) {
  const queryClient = useQueryClient();
  const { loadRequestIntoTab } = useWorkspaceStore();
  const { expandedCollections, expandedFolders, toggleCollection, toggleFolder } = useCollectionStore();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [requestsByCollection, setRequestsByCollection] = useState<Record<string, RequestItem[]>>({});

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: collectionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setNewCollectionName('');
      setShowNewCollection(false);
      toast.success('Collection created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      collectionsService.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection renamed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: collectionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: requestsService.delete,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      // Also update local cache
      setRequestsByCollection((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].filter((r) => r.id !== vars);
        }
        return next;
      });
      toast.success('Request deleted');
    },
  });

  const loadRequests = async (collectionId: string) => {
    if (requestsByCollection[collectionId]) return;
    const reqs = await collectionsService.getRequests(collectionId);
    setRequestsByCollection((prev) => ({ ...prev, [collectionId]: reqs }));
  };

  const handleToggleCollection = async (id: string) => {
    toggleCollection(id);
    if (!expandedCollections.has(id)) {
      await loadRequests(id);
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-[#252525] rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* New Collection form */}
      {showNewCollection && (
        <div className="px-3 py-2 border-b border-[#2a2a2a]">
          <input
            autoFocus
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCollectionName.trim()) {
                createMutation.mutate({ name: newCollectionName.trim() });
              }
              if (e.key === 'Escape') {
                setShowNewCollection(false);
                setNewCollectionName('');
              }
            }}
            placeholder="Collection name…"
            className="w-full bg-[#2a2a2a] border border-[#ff6c37]/50 rounded px-2 py-1.5 text-xs text-[#e8e8e8] focus:outline-none"
          />
          <div className="flex gap-1 mt-1.5">
            <button
              onClick={() => newCollectionName.trim() && createMutation.mutate({ name: newCollectionName.trim() })}
              className="px-2 py-1 bg-[#ff6c37] rounded text-[10px] text-white font-medium"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewCollection(false); setNewCollectionName(''); }}
              className="px-2 py-1 bg-[#2a2a2a] rounded text-[10px] text-[#666]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
        <span className="text-[10px] text-[#444] uppercase tracking-wider font-semibold">
          {filteredCollections.length} Collection{filteredCollections.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowNewCollection(true)}
          className="flex items-center gap-1 text-[#555] hover:text-[#ff6c37] transition-colors text-[10px]"
          title="New Collection"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {filteredCollections.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <FolderOpen className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#444]">No collections yet</p>
            <button
              onClick={() => setShowNewCollection(true)}
              className="mt-2 text-xs text-[#ff6c37] hover:underline"
            >
              Create one
            </button>
          </div>
        ) : (
          filteredCollections.map((collection) => (
            <CollectionNode
              key={collection.id}
              collection={collection}
              requests={requestsByCollection[collection.id] || []}
              isExpanded={expandedCollections.has(collection.id)}
              expandedFolders={expandedFolders}
              onToggle={() => handleToggleCollection(collection.id)}
              onToggleFolder={toggleFolder}
              onOpenRequest={loadRequestIntoTab}
              onRename={(name) => renameMutation.mutate({ id: collection.id, name })}
              onDelete={() => {
                if (confirmDelete === collection.id) {
                  deleteMutation.mutate(collection.id);
                  setConfirmDelete(null);
                } else {
                  setConfirmDelete(collection.id);
                  setTimeout(() => setConfirmDelete(null), 3000);
                }
              }}
              onDeleteRequest={(reqId) => deleteRequestMutation.mutate(reqId)}
              confirmDelete={confirmDelete === collection.id}
              onReloadRequests={() => {
                // Clear cache and reload
                setRequestsByCollection((prev) => { const n = { ...prev }; delete n[collection.id]; return n; });
                loadRequests(collection.id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CollectionNodeProps {
  collection: Collection;
  requests: RequestItem[];
  isExpanded: boolean;
  expandedFolders: Set<string>;
  onToggle: () => void;
  onToggleFolder: (id: string) => void;
  onOpenRequest: (req: Partial<Tab>) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onDeleteRequest: (id: string) => void;
  confirmDelete: boolean;
  onReloadRequests: () => void;
}

function CollectionNode({
  collection, requests, isExpanded, expandedFolders,
  onToggle, onToggleFolder, onOpenRequest, onRename, onDelete, onDeleteRequest, confirmDelete
}: CollectionNodeProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);

  // Group requests by folder
  const folderRequests = (folderId: string | null) =>
    requests.filter((r) => r.folder_id === folderId);

  const handleSaveRename = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editName.trim() && editName.trim() !== collection.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div>
      {/* Collection header */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 hover:bg-[#242424] cursor-pointer group transition-colors"
        onClick={onToggle}
      >
        <span className="text-[#555] shrink-0">
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        <FolderOpen className="w-3.5 h-3.5 text-[#ff6c37] shrink-0" />
        
        {isEditing ? (
          <form onSubmit={handleSaveRename} className="flex-1 flex gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleSaveRename()}
              onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
              className="flex-1 bg-[#1a1a1a] border border-[#ff6c37] rounded px-1 py-0.5 text-xs text-[#e8e8e8] focus:outline-none"
            />
          </form>
        ) : (
          <span className="flex-1 text-xs text-[#ccc] truncate font-medium">{collection.name}</span>
        )}
        
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-0.5 rounded hover:bg-[#333] text-[#555] hover:text-[#aaa]"
            title="More options"
            aria-label="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div className="mx-2 mb-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 py-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
            className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#333] text-[#e8e8e8] transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Rename Collection
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
            className={cn(
              'w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#333] transition-colors',
              confirmDelete ? 'text-red-400' : 'text-[#e8e8e8]'
            )}
          >
            <Trash2 className="w-3 h-3" />
            {confirmDelete ? 'Click again to confirm' : 'Delete Collection'}
          </button>
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-4 border-l border-[#2a2a2a]">
          {/* Root requests (no folder) */}
          {folderRequests(null).map((req) => (
            <RequestNode
              key={req.id}
              request={req}
              onOpen={() => onOpenRequest({ ...req, id: req.id, title: req.name })}
              onDelete={() => onDeleteRequest(req.id)}
            />
          ))}

          {/* Folders */}
          {collection.folders.map((folder) => (
            <FolderNode
              key={folder.id}
              folder={folder}
              requests={folderRequests(folder.id)}
              isExpanded={expandedFolders.has(folder.id)}
              onToggle={() => onToggleFolder(folder.id)}
              onOpenRequest={onOpenRequest}
              onDeleteRequest={onDeleteRequest}
            />
          ))}

          {requests.length === 0 && collection.folders.length === 0 && (
            <div className="px-3 py-2 text-[10px] text-[#444]">No requests</div>
          )}
        </div>
      )}
    </div>
  );
}

function FolderNode({
  folder, requests, isExpanded, onToggle, onOpenRequest, onDeleteRequest
}: {
  folder: FolderType;
  requests: RequestItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onOpenRequest: (req: Partial<Tab>) => void;
  onDeleteRequest: (id: string) => void;
}) {
  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1.5 hover:bg-[#242424] cursor-pointer group transition-colors"
        onClick={onToggle}
      >
        <span className="text-[#555]">
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        <Folder className="w-3 h-3 text-[#777] shrink-0" />
        <span className="flex-1 text-xs text-[#aaa] truncate">{folder.name}</span>
      </div>
      {isExpanded && (
        <div className="ml-4 border-l border-[#252525]">
          {requests.map((req) => (
            <RequestNode
              key={req.id}
              request={req}
              onOpen={() => onOpenRequest({ ...req, id: req.id, title: req.name })}
              onDelete={() => onDeleteRequest(req.id)}
            />
          ))}
          {requests.length === 0 && (
            <div className="px-3 py-1.5 text-[10px] text-[#444]">Empty folder</div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestNode({
  request, onOpen, onDelete
}: { request: RequestItem; onOpen: () => void; onDelete: () => void; }) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const duplicateMutation = useMutation({
    mutationFn: () => requestsService.duplicate(request.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Request duplicated');
    },
  });

  return (
    <div className="group relative">
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#242424] cursor-pointer transition-colors"
        onClick={onOpen}
      >
        <span className={cn('text-[10px] font-bold shrink-0 w-8 text-right', getMethodBadgeColor(request.method).split(' ')[1])}>
          {request.method}
        </span>
        <span className="flex-1 text-xs text-[#aaa] truncate">{request.name}</span>
        {request.is_favorite && <Star className="w-3 h-3 text-[#ff6c37] shrink-0" fill="currentColor" />}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-0.5 rounded hover:bg-[#333] text-[#555] hover:text-[#aaa]"
            aria-label="Request options"
            title="Request options"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="absolute right-1 top-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
          <button
            onClick={() => { duplicateMutation.mutate(); setShowMenu(false); }}
            className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#333] text-[#e8e8e8]"
          >
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button
            onClick={() => { onDelete(); setShowMenu(false); }}
            className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#333] text-red-400"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
