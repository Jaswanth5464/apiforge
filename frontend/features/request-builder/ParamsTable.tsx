'use client';

import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { KeyValueItem } from '@/types/request';

interface ParamsTableProps {
  url: string;
  params: KeyValueItem[];
  onChange: (params: KeyValueItem[]) => void;
  onUrlChange: (url: string) => void;
}

/** Sync URL query params → table */
function parseUrlParams(url: string): KeyValueItem[] {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const result: KeyValueItem[] = [];
    u.searchParams.forEach((value, key) => {
      result.push({ key, value, enabled: true });
    });
    return result;
  } catch {
    return [];
  }
}

/** Sync table → URL */
function buildUrlWithParams(baseUrl: string, params: KeyValueItem[]): string {
  try {
    const enabled = params.filter((p) => p.enabled && p.key);
    if (enabled.length === 0) {
      // Strip query string
      const idx = baseUrl.indexOf('?');
      return idx >= 0 ? baseUrl.slice(0, idx) : baseUrl;
    }
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    url.search = '';
    enabled.forEach((p) => url.searchParams.append(p.key, p.value));
    const result = url.toString();
    return baseUrl.startsWith('http') ? result : result.replace(/^https?:\/\//, '');
  } catch {
    return baseUrl;
  }
}

const emptyRow = (): KeyValueItem => ({ key: '', value: '', description: '', enabled: true });

export function ParamsTable({ url, params, onChange, onUrlChange }: ParamsTableProps) {
  // When URL changes externally, sync params table
  useEffect(() => {
    if (url.includes('?')) {
      const urlParams = parseUrlParams(url);
      // Only sync if different to avoid loops
      const existing = JSON.stringify(params.filter((p) => p.key));
      const incoming = JSON.stringify(urlParams);
      if (existing !== incoming) {
        onChange(urlParams.length > 0 ? urlParams : [emptyRow()]);
      }
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = params.length > 0 ? params : [emptyRow()];

  const update = (index: number, patch: Partial<KeyValueItem>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
    onUrlChange(buildUrlWithParams(url, next));
  };

  const addRow = () => onChange([...rows, emptyRow()]);

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    const result = next.length === 0 ? [emptyRow()] : next;
    onChange(result);
    onUrlChange(buildUrlWithParams(url, result));
  };

  return (
    <div className="p-4">
      <div className="rounded-lg border border-[#2e2e2e] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[32px_1fr_1fr_1fr_36px] bg-[#222] border-b border-[#2e2e2e]">
          <div className="px-2 py-2" />
          <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Key</div>
          <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Value</div>
          <div className="px-3 py-2 text-[10px] font-semibold text-[#555] uppercase tracking-wider">Description</div>
          <div className="px-2 py-2" />
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[32px_1fr_1fr_1fr_36px] border-b border-[#2a2a2a] last:border-0 hover:bg-[#222] transition-colors group"
          >
            <div className="flex items-center justify-center px-2">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => update(i, { enabled: e.target.checked })}
                aria-label="Enable parameter"
                className="w-3.5 h-3.5 rounded accent-[#ff6c37] cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={row.key}
              onChange={(e) => update(i, { key: e.target.value })}
              placeholder="Key"
              className="px-3 py-2 bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#999] focus:outline-none border-r border-[#2a2a2a] font-mono"
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder="Value"
              className="px-3 py-2 bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#999] focus:outline-none border-r border-[#2a2a2a] font-mono"
            />
            <input
              type="text"
              value={row.description || ''}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              className="px-3 py-2 bg-transparent text-xs text-[#777] placeholder:text-[#999] focus:outline-none"
            />
            <div className="flex items-center justify-center px-1">
              <button
                onClick={() => removeRow(i)}
                aria-label="Remove parameter"
                title="Remove parameter"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-[#555] hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-3 flex items-center gap-1.5 text-xs text-[#555] hover:text-[#ff6c37] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Parameter
      </button>
    </div>
  );
}
