'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, MoreHorizontal } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { getMethodBadgeColor, cn } from '@/lib/utils';

export function RequestTabBar() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useWorkspaceStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddTab = () => {
    addTab();
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeTab(id);
  };

  return (
    <div className="flex items-center h-full overflow-hidden gap-0.5">
      {/* Scrollable tab list */}
      <div
        ref={scrollRef}
        className="flex items-center gap-0.5 overflow-x-auto flex-1 min-w-0 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveTab(tab.id);
              }
            }}
            className={cn(
              'group flex items-center gap-1.5 px-3 py-1 rounded text-xs whitespace-nowrap max-w-[180px] shrink-0 transition-all duration-150 cursor-pointer',
              activeTabId === tab.id
                ? 'bg-[#2e2e2e] text-[#e8e8e8]'
                : 'text-[#666] hover:text-[#aaa] hover:bg-[#242424]'
            )}
          >
            <span className={cn('font-bold text-[10px] shrink-0', getMethodBadgeColor(tab.method).split(' ')[1])}>
              {tab.method}
            </span>
            <span className="truncate max-w-[100px]">
              {tab.title || tab.url || 'Untitled'}
            </span>
            {tab.is_dirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6c37] shrink-0" title="Unsaved changes" />
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => handleClose(e, tab.id)}
                title="Close tab"
                aria-label="Close tab"
                suppressHydrationWarning
                className={cn(
                  'ml-0.5 rounded hover:bg-[#444] p-0.5 transition-colors shrink-0 cursor-pointer',
                  activeTabId === tab.id ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
                )}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add tab button */}
      <button
        onClick={handleAddTab}
        suppressHydrationWarning
        className="shrink-0 p-1.5 rounded hover:bg-[#2a2a2a] text-[#555] hover:text-[#aaa] transition-colors"
        title="New tab (Ctrl+T)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
