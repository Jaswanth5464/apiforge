'use client';

import { Zap, Sun, Moon } from 'lucide-react';
import { EnvSelector } from '@/features/environments/EnvSelector';
import { RequestTabBar } from '@/features/request-builder/RequestTabBar';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useEffect } from 'react';

export function TopBar() {
  const { theme, setTheme } = useWorkspaceStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
  }, [setTheme]);

  return (
    <header className="flex items-center h-11 px-3 bg-[#1a1a1a] border-b border-[#2e2e2e] shrink-0 gap-3 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 mr-2">
        <div className="w-7 h-7 rounded-md bg-[#ff6c37] flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Zap className="w-4 h-4 text-white" fill="currentColor" />
        </div>
        <span className="font-bold text-[14px] text-[#e8e8e8] tracking-tight">APIForge</span>
      </div>

      {/* Tab bar takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <RequestTabBar />
      </div>

      {/* Theme Toggle & Env selector */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-md hover:bg-[#2a2a2a] text-[#555] hover:text-[#aaa] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <EnvSelector />
      </div>
    </header>
  );
}
