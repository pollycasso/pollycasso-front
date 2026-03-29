import { useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/entities/user';
import { MOCK_GAME_SELECTING } from '@/mocks/game.mock';
import type { DrawingContext, Player, RoomState } from '@/shared/model';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';

export const useGameState = () => {
  const user = useAuthStore((state) => state.user);
  const { gameSocket } = useGameSocket();

  const [roomState, setRoomState] = useState<RoomState>(MOCK_GAME_SELECTING);

  useEffect(() => {
    if (!gameSocket) return;

    const handleUpdate = (payload: any) => {
      console.log('📢 Game Event Received:', payload);
      setRoomState((prev) => ({
        ...prev,
        ...payload,
        status: payload.phase || payload.status || prev.status,
      }));
    };

    gameSocket.on('room:stateSync', handleUpdate);
    gameSocket.on('room:updateGameState', handleUpdate);

    return () => {
      gameSocket.off('room:stateSync', handleUpdate);
      gameSocket.off('room:updateGameState', handleUpdate);
    };
  }, [gameSocket]);

  const { status, players, endsAt, phaseContext } = roomState;

  const myData = useMemo(() => {
    if (!user) return null;
    return players.find((p: Player) => String(p.userId) === String(user.id)); 
  }, [players, user]);

  const inventory = myData?.inventory || [];

  const currentTheme = useMemo(() => {
    if (status !== 'DRAWING') return null;
    const context = phaseContext as DrawingContext;
    return context?.currentTheme || null;
  }, [status, phaseContext]);

  return {
    status,
    players,
    endsAt,
    inventory,
    currentTheme,
  };
};