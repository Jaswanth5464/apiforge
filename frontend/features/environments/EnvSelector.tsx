'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';
import { useEnvironmentStore } from '@/store/environmentStore';
import { environmentsService } from '@/services/environmentsService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function EnvSelector() {
  const { environments, selectedEnvironmentId, setSelectedEnvironment } = useEnvironmentStore();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    mutationFn: environmentsService.activate,
    onSuccess: (env) => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setSelectedEnvironment(env.id);
    },
  });

  const selected = environments.find((e) => e.id === selectedEnvironmentId);

  const handleSelect = (id: string | null) => {
    setSelectedEnvironment(id);
    setOpen(false);
    if (id) activateMutation.mutate(id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#333] bg-[#242424] hover:bg-[#2a2a2a] text-xs text-[#e8e8e8] transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-[#555]" />
        <span className="max-w-[120px] truncate">{selected?.name || 'No Environment'}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 py-1 min-w-[180px]">
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs hover:bg-[#333] transition-colors',
                !selectedEnvironmentId ? 'text-[#ff6c37]' : 'text-[#e8e8e8]'
              )}
            >
              No Environment
            </button>
            <div className="h-px bg-[#333] my-1" />
            {environments.map((env) => (
              <button
                key={env.id}
                onClick={() => handleSelect(env.id)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs hover:bg-[#333] transition-colors flex items-center gap-2',
                  env.id === selectedEnvironmentId ? 'text-[#ff6c37]' : 'text-[#e8e8e8]'
                )}
              >
                <Globe className="w-3 h-3" />
                {env.name}
                {env.id === selectedEnvironmentId && (
                  <span className="ml-auto text-[9px] bg-[#ff6c37]/15 text-[#ff6c37] px-1 rounded">active</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
