import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  toggleMute: () => void;
  unmute: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      bgmVolume: 0.1,
      sfxVolume: 0.3,
      isMuted: true,
      setBgmVolume: (v) => set({ bgmVolume: v }),
      setSfxVolume: (v) => set({ sfxVolume: v }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      unmute: () => set({ isMuted: false }),
    }),
    {
      name: 'sound-storage',
      partialize: (state) => ({
        bgmVolume: state.bgmVolume,
        sfxVolume: state.sfxVolume,
      }),
    },
  ),
);
