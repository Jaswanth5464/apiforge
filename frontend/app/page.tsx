'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { ActivityBar } from '@/components/layout/ActivityBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RequestBuilder } from '@/features/request-builder/RequestBuilder';
import { ResponseViewer } from '@/features/response-viewer/ResponseViewer';
import { useCollectionStore } from '@/store/collectionStore';
import { useEnvironmentStore } from '@/store/environmentStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { collectionsService } from '@/services/collectionsService';
import { environmentsService } from '@/services/environmentsService';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function WorkspacePage() {
  const [mounted, setMounted] = useState(false);
  const { setCollections } = useCollectionStore();
  const { setEnvironments } = useEnvironmentStore();
  const { tabs, activeTabId, addTab, sidebarCollapsed, sidebarWidth, setSidebarWidth } = useWorkspaceStore();

  useKeyboardShortcuts();

  // Refs for drag logic
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Mount logic
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure at least one tab open
  useEffect(() => {
    if (mounted && tabs.length === 0) addTab();
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load collections
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsService.getAll,
  });
  useEffect(() => {
    if (collections) setCollections(collections);
  }, [collections, setCollections]);

  // Load environments
  const { data: environments } = useQuery({
    queryKey: ['environments'],
    queryFn: environmentsService.getAll,
  });
  useEffect(() => {
    if (environments) setEnvironments(environments);
  }, [environments, setEnvironments]);

  // Drag handlers for the vertical divider
  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const newWidth = ((ev.clientX - containerLeft) / containerWidth) * 100;
      const clamped = Math.max(10, Math.min(60, newWidth));
      setSidebarWidth(clamped);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [setSidebarWidth]);

  // Drag handlers for the horizontal divider (request/response split)
  const requestPanelRef = useRef<HTMLDivElement>(null);
  const responsePanelRef = useRef<HTMLDivElement>(null);
  const verticalSplitRef = useRef(50); // percent for request builder
  const mainPanelRef = useRef<HTMLDivElement>(null);

  const onHDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!mainPanelRef.current) return;
      const rect = mainPanelRef.current.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      const clamped = Math.max(20, Math.min(80, pct));
      if (requestPanelRef.current) requestPanelRef.current.style.flex = `0 0 ${clamped}%`;
      if (responsePanelRef.current) responsePanelRef.current.style.flex = `0 0 ${100 - clamped}%`;
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  if (!mounted) {
    return <div className="h-screen bg-[#1a1a1a]" />;
  }

  const currentSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />

        {/* Resizable content area */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
          {/* Left sidebar */}
          <div
            style={{ width: `${currentSidebarWidth}%`, minWidth: sidebarCollapsed ? 0 : undefined, flexShrink: 0 }}
            className="overflow-hidden transition-none"
          >
            {!sidebarCollapsed && <Sidebar />}
          </div>

          {/* Vertical drag divider */}
          <div
            onMouseDown={onDividerMouseDown}
            className="w-1 bg-[#2e2e2e] hover:bg-[#ff6c37] cursor-col-resize shrink-0 transition-colors duration-150"
            style={{ display: sidebarCollapsed ? 'none' : 'block' }}
          />

          {/* Main panel */}
          <div ref={mainPanelRef} className="flex-1 flex flex-col overflow-hidden">
            {/* Request builder */}
            <div ref={requestPanelRef} style={{ flex: '0 0 50%' }} className="overflow-hidden">
              <RequestBuilder />
            </div>

            {/* Horizontal drag divider */}
            <div
              onMouseDown={onHDividerMouseDown}
              className="h-1 bg-[#2e2e2e] hover:bg-[#ff6c37] cursor-row-resize shrink-0 transition-colors duration-150"
            />

            {/* Response viewer */}
            <div ref={responsePanelRef} style={{ flex: '0 0 50%' }} className="overflow-hidden">
              <ResponseViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
