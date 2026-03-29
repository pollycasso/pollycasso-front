import { useEffect } from 'react';

import { useAuthStore } from '@/entities/user';
import { useSocket } from '@/shared/api/socket';

const ITEM_EFFECTS: Record<string, () => void> = {
  ink_splash: () => {},
  blur: () => {},
  bomb: () => {},
};

export const useItemEffect = () => {
  const { socket } = useSocket();
  const myUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!socket || !myUserId) return;

    const handleApplyEffect = (payload: {
      itemId: string;
      targetUserId: string;
      duration: number;
    }) => {
      const { itemId, targetUserId } = payload;

      if (String(targetUserId) !== String(myUserId)) return; 

      const effectFunc = ITEM_EFFECTS[itemId];
      if (effectFunc) effectFunc();
    };

    socket.on('game:applyEffect', handleApplyEffect);
    return () => {
      socket.off('game:applyEffect', handleApplyEffect);
    };
  }, [socket, myUserId]);
};