'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ParamsTable } from './ParamsTable';
import { HeadersTable } from './HeadersTable';
import { AuthPanel } from './AuthPanel';
import { BodyEditor } from './BodyEditor';
import { cn } from '@/lib/utils';
import type { Tab } from '@/types/runner';

const TABS = [
  { id: 'params', label: 'Params' },
  { id: 'auth', label: 'Authorization' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'settings', label: 'Settings' },
];

interface RequestTabsProps {
  tab: Tab;
}

export function RequestTabs({ tab }: RequestTabsProps) {
  const [activeTab, setActiveTab] = useState('params');
  const { updateActiveTab } = useWorkspaceStore();

  // Count active items for badges
  const paramCount = tab.params.filter((p) => p.enabled && p.key).length;
  const headerCount = tab.headers.filter((h) => h.enabled && h.key).length;
  const hasBody = tab.body_type !== 'none' && !!tab.body_content;
  const hasAuth = tab.auth_type !== 'none';

  const getBadge = (tabId: string) => {
    if (tabId === 'params' && paramCount > 0) return paramCount;
    if (tabId === 'headers' && headerCount > 0) return headerCount;
    return null;
  };

  const hasDot = (tabId: string) => {
    if (tabId === 'body') return hasBody;
    if (tabId === 'auth') return hasAuth;
    return false;
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab navigation */}
      <div className="flex items-center border-b border-[#2e2e2e] bg-[#1e1e1e] px-4 gap-0 shrink-0">
        {TABS.map((t) => {
          const badge = getBadge(t.id);
          const dot = hasDot(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
                activeTab === t.id
                  ? 'border-[#ff6c37] text-[#ff6c37]'
                  : 'border-transparent text-[#666] hover:text-[#aaa]'
              )}
            >
              {t.label}
              {badge !== null && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#ff6c37]/20 text-[#ff6c37] text-[10px] font-bold">
                  {badge}
                </span>
              )}
              {dot && !badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6c37]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'params' && (
          <ParamsTable
            url={tab.url}
            params={tab.params}
            onChange={(params) => updateActiveTab({ params })}
            onUrlChange={(url) => updateActiveTab({ url })}
          />
        )}
        {activeTab === 'auth' && (
          <AuthPanel
            authType={tab.auth_type}
            authData={tab.auth_data}
            onChange={(auth_type, auth_data) => updateActiveTab({ auth_type, auth_data })}
          />
        )}
        {activeTab === 'headers' && (
          <HeadersTable
            headers={tab.headers}
            onChange={(headers) => updateActiveTab({ headers })}
          />
        )}
        {activeTab === 'body' && (
          <BodyEditor
            bodyType={tab.body_type}
            bodyContent={tab.body_content}
            onChange={(body_type, body_content) => updateActiveTab({ body_type, body_content })}
          />
        )}
        {(activeTab === 'scripts' || activeTab === 'settings') && (
          <div className="flex items-center justify-center h-full text-[#444] text-sm">
            <div className="text-center">
              <p className="text-2xl mb-2">🚧</p>
              <p className="font-medium text-[#555]">{activeTab === 'scripts' ? 'Scripts' : 'Settings'}</p>
              <p className="text-xs text-[#444] mt-1">Coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
