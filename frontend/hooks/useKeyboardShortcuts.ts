'use client';

import { useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { runnerService } from '@/services/runnerService';
import { useEnvironmentStore } from '@/store/environmentStore';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
  const { tabs, activeTabId } = useWorkspaceStore();
  const { selectedEnvironmentId } = useEnvironmentStore();
  const { setResponse, setLoading } = useWorkspaceStore();

  const sendRequest = useCallback(async () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeTab.url) {
      toast.error('No URL to send request to');
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const result = await runnerService.run({
        method: activeTab.method,
        url: activeTab.url,
        params: activeTab.params,
        headers: activeTab.headers,
        body_type: activeTab.body_type,
        body_content: activeTab.body_content,
        auth_type: activeTab.auth_type,
        auth_data: activeTab.auth_data,
        environment_id: selectedEnvironmentId,
        timeout: 30,
        follow_redirects: true,
      });
      setResponse(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [tabs, activeTabId, selectedEnvironmentId, setLoading, setResponse]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      if (ctrl && e.key === 'Enter') {
        e.preventDefault();
        sendRequest();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sendRequest]);
}
