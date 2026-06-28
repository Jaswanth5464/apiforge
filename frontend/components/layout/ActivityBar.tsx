'use client';

import { FolderOpen, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore, type SidebarTab } from '@/store/workspaceStore';

export function ActivityBar() {
  const { activeSidebarTab, setActiveSidebarTab } = useWorkspaceStore();

  const tabs: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: 'collections', icon: <FolderOpen className="w-5 h-5" />, label: 'Collections' },
    { id: 'history', icon: <Clock className="w-5 h-5" />, label: 'History' },
    { id: 'environments', icon: <Globe className="w-5 h-5" />, label: 'Environments' },
  ];

  return (
    <div className="flex flex-col items-center py-4 w-12 h-full bg-[#1e1e1e] border-r border-[#2e2e2e] shrink-0 gap-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          title={tab.label}
          onClick={() => setActiveSidebarTab(tab.id)}
          className={cn(
            'flex items-center justify-center w-full py-2 relative transition-colors duration-150',
            activeSidebarTab === tab.id
              ? 'text-[#e8e8e8]'
              : 'text-[#666] hover:text-[#aaa]'
          )}
        >
          {/* Active indicator bar */}
          {activeSidebarTab === tab.id && (
            <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#ff6c37] rounded-r-md" />
          )}
          {tab.icon}
        </button>
      ))}
    </div>
  );
}
