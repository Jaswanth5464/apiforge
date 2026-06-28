'use client';

import { useWorkspaceStore } from '@/store/workspaceStore';
import { UrlBar } from './UrlBar';
import { RequestTabs } from './RequestTabs';

export function RequestBuilder() {
  const { tabs, activeTabId } = useWorkspaceStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1a1a1a]">
        <p className="text-[#555] text-sm">No request open. Create a new tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] overflow-hidden">
      <UrlBar tab={activeTab} />
      <RequestTabs tab={activeTab} />
    </div>
  );
}
