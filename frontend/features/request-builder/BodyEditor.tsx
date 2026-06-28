'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import type { BodyType } from '@/types/request';
import { Plus, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface BodyEditorProps {
  bodyType: BodyType;
  bodyContent: string | null;
  onChange: (type: BodyType, content: string | null) => void;
}

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Text' },
  { value: 'xml', label: 'XML' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
];

const emptyFormRow = () => ({ key: '', value: '', enabled: true });

export function BodyEditor({ bodyType, bodyContent, onChange }: BodyEditorProps) {
  const { theme } = useWorkspaceStore();
  // Parse form rows from JSON-encoded body
  const getFormRows = () => {
    if (!bodyContent) return [emptyFormRow()];
    try {
      return JSON.parse(bodyContent);
    } catch {
      return [emptyFormRow()];
    }
  };

  const updateFormRows = (rows: { key: string; value: string; enabled: boolean }[]) => {
    onChange(bodyType, JSON.stringify(rows));
  };

  const monacoLanguage = bodyType === 'json' ? 'json' : bodyType === 'xml' ? 'xml' : 'plaintext';

  return (
    <div className="flex flex-col h-full">
      {/* Body type selector */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1e1e1e] shrink-0 flex-wrap">
        {BODY_TYPES.map((bt) => (
          <button
            key={bt.value}
            onClick={() => onChange(bt.value, bt.value === 'none' ? null : (bodyContent || ''))}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
              bodyType === bt.value
                ? 'bg-[#ff6c37]/15 text-[#ff6c37] border border-[#ff6c37]/30'
                : 'text-[#666] hover:text-[#aaa] border border-transparent'
            )}
          >
            {bt.label}
          </button>
        ))}
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-hidden">
        {bodyType === 'none' && (
          <div className="flex items-center justify-center h-full text-[#444] text-xs">
            This request has no body
          </div>
        )}

        {(bodyType === 'json' || bodyType === 'text' || bodyType === 'xml') && (
          <MonacoEditor
            height="100%"
            language={monacoLanguage}
            value={bodyContent || ''}
            onChange={(val) => onChange(bodyType, val ?? null)}
            theme={theme === 'light' ? 'light' : 'vs-dark'}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 8, bottom: 8 },
              tabSize: 2,
              automaticLayout: true,
              formatOnPaste: bodyType === 'json',
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
              },
            }}
          />
        )}

        {(bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded') && (
          <div className="p-4">
            <div className="rounded-lg border border-[#2e2e2e] overflow-hidden">
              <div className="grid grid-cols-[32px_1fr_1fr_36px] bg-[#222] border-b border-[#2e2e2e]">
                <div className="px-2 py-2" />
                <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Key</div>
                <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Value</div>
                <div className="px-2 py-2" />
              </div>
              {getFormRows().map((row: { key: string; value: string; enabled: boolean }, i: number) => (
                <div key={i} className="grid grid-cols-[32px_1fr_1fr_36px] border-b border-[#2a2a2a] last:border-0 hover:bg-[#222] group">
                  <div className="flex items-center justify-center px-2">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => {
                        const rows = getFormRows();
                        rows[i].enabled = e.target.checked;
                        updateFormRows(rows);
                      }}
                      aria-label="Enable row"
                      className="w-3.5 h-3.5 rounded accent-[#ff6c37]"
                    />
                  </div>
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => {
                      const rows = getFormRows();
                      rows[i].key = e.target.value;
                      updateFormRows(rows);
                    }}
                    placeholder="Key"
                    className="px-3 py-2 bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#3a3a3a] focus:outline-none border-r border-[#2a2a2a] font-mono"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => {
                      const rows = getFormRows();
                      rows[i].value = e.target.value;
                      updateFormRows(rows);
                    }}
                    placeholder="Value"
                    className="px-3 py-2 bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#3a3a3a] focus:outline-none font-mono"
                  />
                  <div className="flex items-center justify-center px-1">
                    <button
                      onClick={() => {
                        const rows = getFormRows().filter((_: unknown, idx: number) => idx !== i);
                        updateFormRows(rows.length ? rows : [emptyFormRow()]);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-[#555] hover:text-red-400 transition-all"
                      title="Delete field"
                      aria-label="Delete field"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => updateFormRows([...getFormRows(), emptyFormRow()])}
              className="mt-3 flex items-center gap-1.5 text-xs text-[#555] hover:text-[#ff6c37] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
