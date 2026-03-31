import { useMemo } from 'react';

import { useAuthStore } from '@/entities/user';
import type { DrawingContext, Player } from '@/shared/model';
import { useRoomStore } from '@/shared/model/roomStore';

export const useGameState = () => {
  const user = useAuthStore((state) => state.user);
  const roomState = useRoomStore((state) => state.roomState);

  const { status, players, endsAt, phaseContext } = roomState;

  const myData = useMemo(() => {
    if (!user) return null;
    return players.find((p: Player) => String(p.userId) === String(user.id)) ?? null;
  }, [players, user]);

  const inventory = myData?.inventory ?? [];
  const isMeReady = myData?.isReady ?? false;

  const currentTheme = useMemo(() => {
    if (status !== 'DRAWING') return null;
    const context = phaseContext as DrawingContext | null;
    return context?.currentTheme ?? null;
  }, [status, phaseContext]);

  return {
    status,
    players,
    endsAt,
    phaseContext,
    inventory,
    currentTheme,
    isMeReady,
  };
};