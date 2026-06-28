'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { environmentsService } from '@/services/environmentsService';
import { useEnvironmentStore } from '@/store/environmentStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Environment, VariableCreate } from '@/types/environment';

export function EnvironmentManager() {
  const queryClient = useQueryClient();
  const { selectedEnvironmentId, setSelectedEnvironment, setEnvironments, updateEnvironment, addEnvironment, removeEnvironment } = useEnvironmentStore();
  const [expandedEnv, setExpandedEnv] = useState<string | null>(null);
  const [editingVarsFor, setEditingVarsFor] = useState<string | null>(null);
  const [localVars, setLocalVars] = useState<VariableCreate[]>([]);
  const [showNewEnvInput, setShowNewEnvInput] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: environmentsService.getAll,
  });

  useEffect(() => {
    if (environments.length > 0) setEnvironments(environments);
  }, [environments, setEnvironments]);

  const createEnvMutation = useMutation({
    mutationFn: environmentsService.create,
    onSuccess: (env) => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      addEnvironment(env);
      setShowNewEnvInput(false);
      setNewEnvName('');
      toast.success('Environment created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEnvMutation = useMutation({
    mutationFn: environmentsService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      removeEnvironment(id as string);
      if (id === selectedEnvironmentId) {
        setSelectedEnvironment(null);
      }
      toast.success('Environment deleted');
    },
  });

  const activateMutation = useMutation({
    mutationFn: environmentsService.activate,
    onSuccess: (env) => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setSelectedEnvironment(env.id);
    },
  });

  const saveVarsMutation = useMutation({
    mutationFn: ({ envId, vars }: { envId: string; vars: VariableCreate[] }) =>
      environmentsService.bulkUpdateVariables(envId, { variables: vars.filter((v) => v.key.trim()) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setEditingVarsFor(null);
      toast.success('Variables saved');
    },
  });

  const startEditVars = (env: Environment) => {
    setEditingVarsFor(env.id);
    setLocalVars(env.variables.map((v) => ({ key: v.key, value: v.value, enabled: v.enabled })));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
        <span className="text-[10px] text-[#444] uppercase tracking-wider font-semibold">
          {environments.length} Environment{environments.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowNewEnvInput(true)}
          className="text-[#555] hover:text-[#ff6c37] transition-colors"
          title="New Environment"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {showNewEnvInput && (
        <div className="px-3 py-2 border-b border-[#2a2a2a]">
          <input
            autoFocus
            type="text"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newEnvName.trim()) createEnvMutation.mutate({ name: newEnvName.trim() });
              if (e.key === 'Escape') { setShowNewEnvInput(false); setNewEnvName(''); }
            }}
            placeholder="Environment name…"
            className="w-full bg-[#2a2a2a] border border-[#ff6c37]/50 rounded px-2 py-1.5 text-xs text-[#e8e8e8] focus:outline-none"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {environments.map((env) => (
          <div key={env.id} className="border-b border-[#1e1e1e] last:border-0">
            {/* Env header */}
            <div className="group flex items-center gap-2 px-3 py-2 hover:bg-[#242424] transition-colors">
              <button
                onClick={() => setExpandedEnv(expandedEnv === env.id ? null : env.id)}
                className="text-[#555] shrink-0"
              >
                {expandedEnv === env.id
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />}
              </button>
              <Globe className="w-3.5 h-3.5 text-[#555] shrink-0" />
              <span className="flex-1 text-xs text-[#ccc] truncate">{env.name}</span>
              {env.id === selectedEnvironmentId && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#ff6c37]/15 text-[#ff6c37] border border-[#ff6c37]/20 shrink-0">
                  Active
                </span>
              )}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {env.id !== selectedEnvironmentId && (
                  <button
                    onClick={() => activateMutation.mutate(env.id)}
                    className="p-0.5 rounded hover:bg-[#333] text-[#555] hover:text-[#ff6c37]"
                    title="Set as active"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => deleteEnvMutation.mutate(env.id)}
                  className="p-0.5 rounded hover:bg-red-500/20 text-[#555] hover:text-red-400"
                  title="Delete environment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Variables table */}
            {expandedEnv === env.id && (
              <div className="px-3 pb-3">
                {editingVarsFor === env.id ? (
                  <div className="space-y-1">
                    {[...localVars, { key: '', value: '', enabled: true }].map((v, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          title="Enable Variable"
                          checked={v.enabled}
                          onChange={(e) => {
                            const next = [...localVars];
                            if (next[i]) next[i].enabled = e.target.checked;
                            setLocalVars(next);
                          }}
                          className="w-3.5 h-3.5 accent-[#ff6c37] shrink-0"
                        />
                        <input
                          type="text"
                          value={v.key}
                          onChange={(e) => {
                            const next = [...localVars];
                            if (i < next.length) {
                              next[i].key = e.target.value;
                            } else {
                              next.push({ key: e.target.value, value: '', enabled: true });
                            }
                            setLocalVars(next);
                          }}
                          placeholder="KEY"
                          className="flex-1 bg-[#2a2a2a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#e8e8e8] font-mono focus:outline-none focus:border-[#ff6c37]"
                        />
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) => {
                            const next = [...localVars];
                            if (i < next.length) {
                              next[i].value = e.target.value;
                            } else {
                              next.push({ key: '', value: e.target.value, enabled: true });
                            }
                            setLocalVars(next);
                          }}
                          placeholder="VALUE"
                          className="flex-1 bg-[#2a2a2a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#aaa] font-mono focus:outline-none focus:border-[#ff6c37]"
                        />
                        {i < localVars.length && (
                          <button
                            onClick={() => setLocalVars(localVars.filter((_, idx) => idx !== i))}
                            className="p-0.5 text-[#555] hover:text-red-400"
                            title="Remove variable"
                            aria-label="Remove variable"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => saveVarsMutation.mutate({ envId: env.id, vars: localVars })}
                        className="px-2 py-1 bg-[#ff6c37] rounded text-[10px] text-white font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingVarsFor(null)}
                        className="px-2 py-1 bg-[#2a2a2a] rounded text-[10px] text-[#666]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {env.variables.length === 0 ? (
                      <p className="text-[10px] text-[#444] py-1">No variables</p>
                    ) : (
                      <div className="space-y-0.5 mb-2">
                        {env.variables.map((v) => (
                          <div key={v.id} className="flex items-center gap-1 text-[11px]">
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', v.enabled ? 'bg-emerald-400' : 'bg-[#444]')} />
                            <span className="text-[#aaa] font-mono truncate">{v.key}</span>
                            <span className="text-[#555]">=</span>
                            <span className="text-[#666] font-mono truncate flex-1">{v.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => startEditVars(env)}
                      className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#ff6c37] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Variables
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {environments.length === 0 && !showNewEnvInput && (
          <div className="px-4 py-8 text-center">
            <Globe className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#444]">No environments yet</p>
            <button
              onClick={() => setShowNewEnvInput(true)}
              className="mt-2 text-xs text-[#ff6c37] hover:underline"
            >
              Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
