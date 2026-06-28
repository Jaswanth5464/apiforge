'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CollectionTree } from '@/features/collections/CollectionTree';
import { HistoryList } from '@/features/history/HistoryList';
import { EnvironmentManager } from '@/features/environments/EnvironmentManager';
import { useWorkspaceStore } from '@/store/workspaceStore';

export function Sidebar() {
  const { activeSidebarTab } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#2e2e2e]">

      {/* Search */}
      <div className="px-2 py-2 shrink-0 border-b border-[#2e2e2e]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
          <input
            type="text"
            placeholder={`Search ${activeSidebarTab}…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2a2a] border border-[#333] rounded-md pl-7 pr-3 py-1.5 text-xs text-[#e8e8e8] placeholder:text-[#555] focus:outline-none focus:border-[#ff6c37] focus:ring-1 focus:ring-[#ff6c37]/20 transition-colors"
          />
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeSidebarTab === 'collections' && <CollectionTree searchQuery={searchQuery} />}
        {activeSidebarTab === 'history' && <HistoryList searchQuery={searchQuery} />}
        {activeSidebarTab === 'environments' && <EnvironmentManager />}
      </div>
    </div>
  );
}
