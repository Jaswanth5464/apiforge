'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestsService } from '@/services/requestsService';
import { collectionsService } from '@/services/collectionsService';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { toast } from 'sonner';
import type { Tab } from '@/types/runner';

interface SaveRequestModalProps {
  tab: Tab;
  onClose: () => void;
}

export function SaveRequestModal({ tab, onClose }: SaveRequestModalProps) {
  const queryClient = useQueryClient();
  const { updateActiveTab } = useWorkspaceStore();
  const [name, setName] = useState(tab.title !== 'Untitled Request' ? tab.title : tab.url || '');
  const [collectionId, setCollectionId] = useState('');

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsService.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!collectionId) throw new Error('Please select a collection');
      if (!name.trim()) throw new Error('Please enter a request name');

      if (tab.request_id) {
        // Update existing
        return requestsService.update(tab.request_id, {
          name: name.trim(),
          method: tab.method,
          url: tab.url,
          params: tab.params,
          headers: tab.headers,
          body_type: tab.body_type,
          body_content: tab.body_content,
          auth_type: tab.auth_type,
          auth_data: tab.auth_data,
        });
      } else {
        // Create new
        return requestsService.create({
          collection_id: collectionId,
          name: name.trim(),
          method: tab.method,
          url: tab.url,
          params: tab.params,
          headers: tab.headers,
          body_type: tab.body_type,
          body_content: tab.body_content,
          auth_type: tab.auth_type,
          auth_data: tab.auth_data,
        });
      }
    },
    onSuccess: (req) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      updateActiveTab({ request_id: req.id, title: req.name, is_dirty: false });
      toast.success('Request saved');
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl shadow-2xl w-[440px] max-w-[95vw]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-[#ff6c37]" />
            <h2 className="text-sm font-semibold text-[#e8e8e8]">Save Request</h2>
          </div>
          <button onClick={onClose} title="Close" aria-label="Close" className="text-[#555] hover:text-[#aaa] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="request-name-input" className="block text-xs text-[#666] mb-1.5">Request Name *</label>
            <input
              id="request-name-input"
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveMutation.mutate()}
              placeholder="e.g. Get Users"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#e8e8e8] placeholder:text-[#444] focus:outline-none focus:border-[#ff6c37] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="collection-select" className="block text-xs text-[#666] mb-1.5">Collection *</label>
            <select
              id="collection-select"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-[#ff6c37] transition-colors"
            >
              <option value="">Select a collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#333] text-xs text-[#666] hover:text-[#aaa] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="px-4 py-2 rounded-lg bg-[#ff6c37] hover:bg-[#ff8555] disabled:opacity-50 text-white text-xs font-bold transition-colors"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
