'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { KeyValueItem } from '@/types/request';

interface HeadersTableProps {
  headers: KeyValueItem[];
  onChange: (headers: KeyValueItem[]) => void;
}

const COMMON_HEADERS = [
  'Accept', 'Accept-Language', 'Authorization', 'Cache-Control',
  'Content-Type', 'X-API-Key', 'X-Request-ID',
];

const emptyRow = (): KeyValueItem => ({ key: '', value: '', description: '', enabled: true });

export function HeadersTable({ headers, onChange }: HeadersTableProps) {
  const rows = headers.length > 0 ? headers : [emptyRow()];

  const update = (index: number, patch: Partial<KeyValueItem>) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => onChange([...rows, emptyRow()]);

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length === 0 ? [emptyRow()] : next);
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
                aria-label="Enable header"
                className="w-3.5 h-3.5 rounded accent-[#ff6c37] cursor-pointer"
              />
            </div>
            <input
              type="text"
              list="header-suggestions"
              value={row.key}
              onChange={(e) => update(i, { key: e.target.value })}
              placeholder="Header name"
              className="px-3 py-2 bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#3a3a3a] focus:outline-none border-r border-[#2a2a2a] font-mono"
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder="Value"
              className="px-3 py-2 bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#3a3a3a] focus:outline-none border-r border-[#2a2a2a] font-mono"
            />
            <input
              type="text"
              value={row.description || ''}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              className="px-3 py-2 bg-transparent text-xs text-[#777] placeholder:text-[#3a3a3a] focus:outline-none"
            />
            <div className="flex items-center justify-center px-1">
              <button
                onClick={() => removeRow(i)}
                title="Delete row"
                aria-label="Delete row"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-[#555] hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <datalist id="header-suggestions">
        {COMMON_HEADERS.map((h) => <option key={h} value={h} />)}
      </datalist>

      <button
        onClick={addRow}
        className="mt-3 flex items-center gap-1.5 text-xs text-[#555] hover:text-[#ff6c37] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Header
      </button>
    </div>
  );
}
