import { createContext, useContext, useEffect, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { SoundManager } from '@/shared/api/sound/manager';
import { SOUND_ASSETS } from '@/shared/api/sound/assets';
import { useSoundStore } from './useSoundStore';

interface SoundContextType {
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  toggleMute: () => void;
  unmute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    bgmVolume,
    sfxVolume,
    isMuted,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
    unmute,
  } = useSoundStore();

  useEffect(() => {
    const handleFirstClick = () => {
      SoundManager.resume();
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  useEffect(() => {
    if (isMuted) {
      // 뮤트 상태면 볼륨만 0으로 (정지시키면 다시 켤 때 처음부터 재생됨)
      SoundManager.setBgmVolume(0);
    } else {
      // 뮤트 해제 시점에만 playBgm 호출
      SoundManager.playBgm(SOUND_ASSETS.BGM.LOBBY, bgmVolume);
    }
  }, [isMuted, bgmVolume]);

  const value = useMemo(
    () => ({
      bgmVolume,
      sfxVolume,
      isMuted,
      setBgmVolume,
      setSfxVolume,
      toggleMute,
      unmute,
    }),
    [
      bgmVolume,
      sfxVolume,
      isMuted,
      setBgmVolume,
      setSfxVolume,
      toggleMute,
      unmute,
    ],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};
