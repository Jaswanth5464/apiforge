'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Trash2, X } from 'lucide-react';
import { historyService } from '@/services/historyService';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { getMethodBadgeColor, formatTimestamp, truncateUrl, getStatusBg, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { HistoryEntry } from '@/types/runner';

interface HistoryListProps {
  searchQuery: string;
}

export function HistoryList({ searchQuery }: HistoryListProps) {
  const queryClient = useQueryClient();
  const { loadRequestIntoTab } = useWorkspaceStore();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => historyService.getAll(200),
    refetchInterval: 10000, // Refresh every 10s
  });

  const deleteMutation = useMutation({
    mutationFn: historyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: historyService.clearAll,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(`Cleared ${data.deleted} history entries`);
    },
  });

  const filtered = searchQuery
    ? history.filter(
        (h) =>
          h.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.method.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  const handleOpen = (entry: HistoryEntry) => {
    loadRequestIntoTab({
      title: truncateUrl(entry.url, 30),
      method: entry.method,
      url: entry.url,
      params: entry.params,
      headers: entry.headers,
      body_type: entry.body_type,
      body_content: entry.body_content,
      auth_type: entry.auth_type,
      auth_data: entry.auth_data,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-[#252525] rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
        <span className="text-[10px] text-[#444] uppercase tracking-wider font-semibold">
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
        </span>
        {history.length > 0 && (
          <button
            onClick={() => clearMutation.mutate()}
            className="text-[10px] text-[#555] hover:text-red-400 transition-colors flex items-center gap-1"
            title="Clear all history"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Clock className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#444]">
              {searchQuery ? 'No matching history' : 'No history yet'}
            </p>
            <p className="text-[10px] text-[#333] mt-1">Send a request to see it here</p>
          </div>
        ) : (
          filtered.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-start gap-2 px-3 py-2 hover:bg-[#242424] cursor-pointer transition-colors border-b border-[#1e1e1e] last:border-0"
              onClick={() => handleOpen(entry)}
            >
              <span className={cn('text-[10px] font-bold shrink-0 mt-0.5 w-10 text-right', getMethodBadgeColor(entry.method).split(' ')[1])}>
                {entry.method}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#aaa] truncate font-mono">{truncateUrl(entry.url)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {entry.status_code && (
                    <span className={cn('text-[10px] font-bold px-1 rounded', getStatusBg(entry.status_code))}>
                      {entry.status_code}
                    </span>
                  )}
                  {entry.error && (
                    <span className="text-[10px] text-red-400">Error</span>
                  )}
                  <span className="text-[10px] text-[#444]">{formatTimestamp(entry.timestamp)}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(entry.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-[#555] hover:text-red-400 transition-all shrink-0 mt-0.5"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
