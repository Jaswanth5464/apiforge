'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { cn, getStatusBg, formatMs, formatBytes, prettifyJson, downloadText } from '@/lib/utils';
import { Download, Copy, CheckCircle2, AlertCircle, Clock, Database } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type ResponseTab = 'pretty' | 'raw' | 'headers' | 'preview';

export function ResponseViewer() {
  const { response, isLoading, theme } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty');

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#1a1a1a] border-t border-[#2e2e2e]">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2e2e2e] bg-[#1e1e1e] shrink-0">
          <span className="text-xs text-[#666]">Response</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#333] border-t-[#ff6c37] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#555]">Sending request…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col h-full bg-[#1a1a1a] border-t border-[#2e2e2e]">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2e2e2e] bg-[#1e1e1e] shrink-0">
          <span className="text-xs text-[#666]">Response</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#333]">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-sm font-medium text-[#444]">Hit Send to get a response</p>
            <p className="text-xs text-[#333] mt-1">Press Ctrl+Enter to send quickly</p>
          </div>
        </div>
      </div>
    );
  }

  const isError = response.status_code === 0;
  const contentType = response.content_type || '';
  const isJson = contentType.includes('json') || (() => { try { JSON.parse(response.body); return true; } catch { return false; } })();
  const prettyBody = isJson ? prettifyJson(response.body) : response.body;

  const handleCopy = () => {
    navigator.clipboard.writeText(response.body);
    toast.success('Response copied to clipboard');
  };

  const handleDownload = () => {
    const ext = isJson ? 'json' : 'txt';
    downloadText(response.body, `response.${ext}`);
    toast.success('Response downloaded');
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] border-t border-[#2e2e2e]">
      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#2e2e2e] bg-[#1e1e1e] shrink-0">
        {/* Status badge */}
        {isError ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold bg-red-500/15 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        ) : (
          <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-bold', getStatusBg(response.status_code))}>
            <CheckCircle2 className="w-3 h-3" />
            {response.status_code} {response.status_text}
          </span>
        )}

        {/* Metrics */}
        {!isError && (
          <>
            <div className="flex items-center gap-1 text-xs text-[#666]">
              <Clock className="w-3 h-3" />
              <span>{formatMs(response.response_time_ms)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#666]">
              <Database className="w-3 h-3" />
              <span>{formatBytes(response.response_size_bytes)}</span>
            </div>
          </>
        )}

        {/* Error message */}
        {isError && response.error && (
          <span className="text-xs text-red-400 truncate flex-1">{response.error}</span>
        )}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#555] hover:text-[#aaa] transition-colors"
            title="Copy response"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#555] hover:text-[#aaa] transition-colors"
            title="Download response"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Response tabs */}
      <div className="flex items-center border-b border-[#2e2e2e] bg-[#1e1e1e] px-4 shrink-0">
        {(['pretty', 'raw', 'headers', 'preview'] as ResponseTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-3 py-2 text-xs font-medium capitalize border-b-2 transition-colors',
              activeTab === t
                ? 'border-[#ff6c37] text-[#ff6c37]'
                : 'border-transparent text-[#666] hover:text-[#aaa]'
            )}
          >
            {t}
            {t === 'headers' && ` (${Object.keys(response.headers).length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'pretty' && (
          <MonacoEditor
            height="100%"
            language={isJson ? 'json' : contentType.includes('xml') ? 'xml' : 'plaintext'}
            value={prettyBody}
            theme={theme === 'light' ? 'light' : 'vs-dark'}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 8 },
              automaticLayout: true,
            }}
          />
        )}

        {activeTab === 'raw' && (
          <pre className="h-full overflow-auto p-4 text-xs text-[#e8e8e8] font-mono whitespace-pre-wrap break-words leading-5">
            {response.body || '(empty response)'}
          </pre>
        )}

        {activeTab === 'headers' && (
          <div className="p-4 overflow-auto h-full">
            <div className="rounded-lg border border-[#2e2e2e] overflow-hidden">
              <div className="grid grid-cols-2 bg-[#222] border-b border-[#2e2e2e]">
                <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Header</div>
                <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Value</div>
              </div>
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 border-b border-[#2a2a2a] last:border-0 hover:bg-[#222] transition-colors">
                  <div className="px-3 py-2 text-xs text-[#aaa] font-mono">{key}</div>
                  <div className="px-3 py-2 text-xs text-[#e8e8e8] font-mono break-all">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full overflow-auto">
            {contentType.includes('html') ? (
              <iframe
                srcDoc={response.body}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin"
                title="Response preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#444] text-xs">
                <div className="text-center">
                  <p className="text-2xl mb-2">🖼️</p>
                  <p>Preview not available for <code className="text-[#666]">{contentType || 'this content type'}</code></p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
