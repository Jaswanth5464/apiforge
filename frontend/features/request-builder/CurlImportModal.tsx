'use client';

import { useState } from 'react';
import { X, Terminal } from 'lucide-react';
import { parseCurl } from '@/lib/curlImporter';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { toast } from 'sonner';

interface CurlImportModalProps {
  onClose: () => void;
}

export function CurlImportModal({ onClose }: CurlImportModalProps) {
  const [input, setInput] = useState('');
  const { loadRequestIntoTab } = useWorkspaceStore();

  const handleImport = () => {
    if (!input.trim()) {
      toast.error('Please paste a cURL command');
      return;
    }
    try {
      const parsed = parseCurl(input.trim());
      if (!parsed.url) {
        toast.error('Could not extract URL from cURL command');
        return;
      }
      loadRequestIntoTab({
        title: parsed.url,
        ...parsed,
      });
      toast.success('cURL imported successfully');
      onClose();
    } catch {
      toast.error('Failed to parse cURL command');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl shadow-2xl w-[560px] max-w-[95vw]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ff6c37]" />
            <h2 className="text-sm font-semibold text-[#e8e8e8]">Import cURL Command</h2>
          </div>
          <button onClick={onClose} title="Close" aria-label="Close" className="text-[#555] hover:text-[#aaa] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <label className="block text-xs text-[#666] mb-2">Paste your cURL command below:</label>
          <textarea
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`curl 'https://api.example.com/users' \\\n  -H 'Authorization: Bearer token' \\\n  -H 'Content-Type: application/json'`}
            rows={8}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-xs text-[#e8e8e8] font-mono placeholder:text-[#999] focus:outline-none focus:border-[#ff6c37] resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#333] text-xs text-[#666] hover:text-[#aaa] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 rounded-lg bg-[#ff6c37] hover:bg-[#ff8555] text-white text-xs font-bold transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
