'use client';

import { useState } from 'react';
import { Send, Save, ChevronDown, Code2, Copy, Check } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useEnvironmentStore } from '@/store/environmentStore';
import { runnerService } from '@/services/runnerService';
import { requestsService } from '@/services/requestsService';
import { getMethodBadgeColor, cn } from '@/lib/utils';
import { generateCurl, generateFetchCode, generatePythonCode } from '@/lib/codeGenerators';
import { parseCurl } from '@/lib/curlImporter';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CurlImportModal } from './CurlImportModal';
import { SaveRequestModal } from './SaveRequestModal';
import type { Tab } from '@/types/runner';
import type { HttpMethod } from '@/types/request';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

interface UrlBarProps {
  tab: Tab;
}

export function UrlBar({ tab }: UrlBarProps) {
  const { updateActiveTab, setResponse, setLoading, isLoading } = useWorkspaceStore();
  const { selectedEnvironmentId } = useEnvironmentStore();
  const queryClient = useQueryClient();
  const [showMethodMenu, setShowMethodMenu] = useState(false);
  const [showCodeMenu, setShowCodeMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    if (!tab.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const result = await runnerService.run({
        method: tab.method,
        url: tab.url,
        params: tab.params,
        headers: tab.headers,
        body_type: tab.body_type,
        body_content: tab.body_content,
        auth_type: tab.auth_type,
        auth_data: tab.auth_data,
        environment_id: selectedEnvironmentId,
        timeout: 30,
        follow_redirects: true,
      });
      setResponse(result);
      // Refresh history sidebar immediately after send
      queryClient.invalidateQueries({ queryKey: ['history'] });
      if (result.error && result.status_code === 0) {
        toast.error(result.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const curl = generateCurl({
      method: tab.method,
      url: tab.url,
      params: tab.params,
      headers: tab.headers,
      body_type: tab.body_type,
      body_content: tab.body_content,
      auth_type: tab.auth_type,
      auth_data: tab.auth_data,
    });
    navigator.clipboard.writeText(curl);
    setCopied(true);
    toast.success('cURL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = (lang: 'fetch' | 'python') => {
    const opts = {
      method: tab.method,
      url: tab.url,
      params: tab.params,
      headers: tab.headers,
      body_type: tab.body_type,
      body_content: tab.body_content,
      auth_type: tab.auth_type,
      auth_data: tab.auth_data,
    };
    const code = lang === 'fetch' ? generateFetchCode(opts) : generatePythonCode(opts);
    navigator.clipboard.writeText(code);
    toast.success(`${lang === 'fetch' ? 'Fetch' : 'Python'} code copied`);
    setShowCodeMenu(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e2e2e] shrink-0 bg-[#1e1e1e]">
        {/* Method dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMethodMenu(!showMethodMenu)}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-md text-xs font-bold border border-[#333] bg-[#242424] hover:bg-[#2a2a2a] transition-colors',
              getMethodBadgeColor(tab.method)
            )}
          >
            {tab.method}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {showMethodMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    updateActiveTab({ method: m });
                    setShowMethodMenu(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-[#333] transition-colors',
                    getMethodBadgeColor(m)
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL input */}
        <input
          type="text"
          value={tab.url}
          onChange={(e) => updateActiveTab({ url: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Enter request URL or {{BASE_URL}}/endpoint"
          className="flex-1 bg-[#242424] border border-[#333] rounded-md px-3 py-2 text-sm text-[#e8e8e8] placeholder:text-[#444] focus:outline-none focus:border-[#ff6c37] focus:ring-1 focus:ring-[#ff6c37]/20 transition-colors font-mono"
        />

        {/* Code generation menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowCodeMenu(!showCodeMenu)}
            title="Generate code"
            className="p-2 rounded-md border border-[#333] bg-[#242424] hover:bg-[#2a2a2a] text-[#999] hover:text-[#e8e8e8] transition-colors"
          >
            <Code2 className="w-4 h-4" />
          </button>
          {showCodeMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 py-1 min-w-[180px]">
              <button
                onClick={handleCopyCurl}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#333] text-[#e8e8e8] flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy as cURL
              </button>
              <button
                onClick={() => handleGenerateCode('fetch')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#333] text-[#e8e8e8]"
              >
                JavaScript (Fetch)
              </button>
              <button
                onClick={() => handleGenerateCode('python')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#333] text-[#e8e8e8]"
              >
                Python (requests)
              </button>
              <div className="h-px bg-[#333] my-1" />
              <button
                onClick={() => { setShowImportModal(true); setShowCodeMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#333] text-[#e8e8e8]"
              >
                Import cURL…
              </button>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#333] bg-[#242424] hover:bg-[#2a2a2a] text-[#ccc] hover:text-[#e8e8e8] text-xs font-medium transition-colors shrink-0"
          title="Save request (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !tab.url.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#ff6c37] hover:bg-[#ff8555] disabled:opacity-80 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shrink-0 shadow-lg shadow-orange-500/20"
          title="Send (Ctrl+Enter)"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Send
        </button>
      </div>

      {showImportModal && (
        <CurlImportModal onClose={() => setShowImportModal(false)} />
      )}
      {showSaveModal && (
        <SaveRequestModal tab={tab} onClose={() => setShowSaveModal(false)} />
      )}
    </>
  );
}
