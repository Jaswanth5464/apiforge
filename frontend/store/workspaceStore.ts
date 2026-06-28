import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { HttpMethod, BodyType, AuthType, KeyValueItem, AuthData } from '@/types/request';
import type { RunResponse, Tab } from '@/types/runner';

const DEFAULT_TAB: Omit<Tab, 'id' | 'order_idx'> = {
  request_id: null,
  title: 'Untitled Request',
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body_type: 'none',
  body_content: null,
  auth_type: 'none',
  auth_data: {},
  is_dirty: false,
};

export type SidebarTab = 'collections' | 'history' | 'environments';

interface WorkspaceState {
  // Sidebar
  sidebarCollapsed: boolean;
  activeSidebarTab: SidebarTab;
  sidebarWidth: number;

  // Tabs
  tabs: Tab[];
  activeTabId: string | null;

  // Response
  response: RunResponse | null;
  isLoading: boolean;

  // Tab actions
  addTab: (partial?: Partial<Tab>) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (patch: Partial<Tab>) => void;
  loadRequestIntoTab: (request: Partial<Tab> & { id?: string }) => void;

  // Sidebar actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setSidebarWidth: (width: number) => void;

  // Runner
  setResponse: (response: RunResponse | null) => void;
  setLoading: (loading: boolean) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

let tabCounter = 0;
const newId = () => `tab-${++tabCounter}-${Date.now()}`;

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      response: null,
      isLoading: false,
      theme: 'dark',

      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', theme);
          if (theme === 'light') {
            document.body.classList.add('light');
          } else {
            document.body.classList.remove('light');
          }
        }
      },

      sidebarCollapsed: false,
      activeSidebarTab: 'collections',
      sidebarWidth: 20,

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveSidebarTab: (tab) => {
        const state = get();
        if (state.activeSidebarTab === tab) {
          // Toggle collapse if clicking the same active tab
          set({ sidebarCollapsed: !state.sidebarCollapsed });
        } else {
          // Switch to new tab and ensure sidebar is open
          set({ activeSidebarTab: tab, sidebarCollapsed: false });
        }
      },
      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      addTab: (partial = {}) => {
        const id = newId();
        const tab: Tab = {
          ...DEFAULT_TAB,
          ...partial,
          id,
          order_idx: get().tabs.length,
        };
        set((s) => ({
          tabs: [...s.tabs, tab],
          activeTabId: id,
          response: null,
        }));
        return id;
      },

      closeTab: (id) => {
        set((s) => {
          const tabs = s.tabs.filter((t) => t.id !== id);
          let activeTabId = s.activeTabId;
          if (activeTabId === id) {
            const idx = s.tabs.findIndex((t) => t.id === id);
            activeTabId = tabs[Math.max(0, idx - 1)]?.id ?? tabs[0]?.id ?? null;
          }
          return { tabs, activeTabId, response: null };
        });
      },

      setActiveTab: (id) => {
        set({ activeTabId: id, response: null });
      },

      updateActiveTab: (patch) => {
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === s.activeTabId ? { ...t, ...patch, is_dirty: true } : t
          ),
        }));
      },

      loadRequestIntoTab: (request) => {
        const { tabs, activeTabId } = get();
        // If active tab is empty/default, reuse it
        const active = tabs.find((t) => t.id === activeTabId);
        if (active && active.url === '' && !active.is_dirty) {
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === activeTabId
                ? {
                    ...t,
                    request_id: request.id ?? null,
                    title: request.title || request.url || 'Untitled',
                    method: request.method || 'GET',
                    url: request.url || '',
                    params: request.params || [],
                    headers: request.headers || [],
                    body_type: request.body_type || 'none',
                    body_content: request.body_content ?? null,
                    auth_type: request.auth_type || 'none',
                    auth_data: request.auth_data || {},
                    is_dirty: false,
                  }
                : t
            ),
            response: null,
          }));
        } else {
          // Open in new tab
          const id = newId();
          const tab: Tab = {
            id,
            request_id: request.id ?? null,
            title: request.title || request.url || 'Untitled',
            method: request.method || 'GET',
            url: request.url || '',
            params: request.params || [],
            headers: request.headers || [],
            body_type: request.body_type || 'none',
            body_content: request.body_content ?? null,
            auth_type: request.auth_type || 'none',
            auth_data: request.auth_data || {},
            is_dirty: false,
            order_idx: tabs.length,
          };
          set((s) => ({ tabs: [...s.tabs, tab], activeTabId: id, response: null }));
        }
      },

      setResponse: (response) => set({ response }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'workspace-store' }
  )
);
