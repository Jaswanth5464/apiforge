import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Environment } from '@/types/environment';

interface EnvironmentState {
  environments: Environment[];
  selectedEnvironmentId: string | null;

  setEnvironments: (environments: Environment[]) => void;
  setSelectedEnvironment: (id: string | null) => void;
  addEnvironment: (env: Environment) => void;
  updateEnvironment: (env: Environment) => void;
  removeEnvironment: (id: string) => void;
  getSelectedEnvironment: () => Environment | null;
  getResolvedVariables: () => Record<string, string>;
}

export const useEnvironmentStore = create<EnvironmentState>()(
  devtools(
    (set, get) => ({
      environments: [],
      selectedEnvironmentId: null,

      setEnvironments: (environments) => {
        const active = environments.find((e) => e.is_active);
        set({
          environments,
          selectedEnvironmentId: active?.id ?? environments[0]?.id ?? null,
        });
      },

      setSelectedEnvironment: (id) => set({ selectedEnvironmentId: id }),

      addEnvironment: (env) =>
        set((s) => ({ environments: [...s.environments, env] })),

      updateEnvironment: (env) =>
        set((s) => ({
          environments: s.environments.map((e) => (e.id === env.id ? env : e)),
        })),

      removeEnvironment: (id) =>
        set((s) => {
          const environments = s.environments.filter((e) => e.id !== id);
          const selectedEnvironmentId =
            s.selectedEnvironmentId === id
              ? (environments[0]?.id ?? null)
              : s.selectedEnvironmentId;
          return { environments, selectedEnvironmentId };
        }),

      getSelectedEnvironment: () => {
        const { environments, selectedEnvironmentId } = get();
        return environments.find((e) => e.id === selectedEnvironmentId) ?? null;
      },

      getResolvedVariables: () => {
        const { environments, selectedEnvironmentId } = get();
        const env = environments.find((e) => e.id === selectedEnvironmentId);
        if (!env) return {};
        return Object.fromEntries(
          env.variables
            .filter((v) => v.enabled && v.key)
            .map((v) => [v.key, v.value])
        );
      },
    }),
    { name: 'environment-store' }
  )
);
