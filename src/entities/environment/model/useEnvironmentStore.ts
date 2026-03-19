import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnvironmentState {
  leafCount: number;
  setLeafCount: (count: number) => void;
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set) => ({
      leafCount: 8,
      setLeafCount: (count) => set({ leafCount: count }),
    }),
    {
      name: 'environment-storage',
    },
  ),
);
