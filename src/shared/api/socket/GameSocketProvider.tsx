import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '@/entities/user';
import { getGameSocket } from './gameSocketInstance';

interface GameSocketContextProps {
  gameSocket: Socket | null;
  isGameConnected: boolean;
}

const GameSocketContext = createContext<GameSocketContextProps | null>(null);

export const GameSocketProvider = ({ children }: { children: ReactNode }) => {
  const gameSocket = getGameSocket();

  const [isGameConnected, setIsGameConnected] = useState(
    gameSocket.connected,
  );

  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token || !gameSocket) return;

    gameSocket.auth = { token };

    const handleConnect = () => {
      setIsGameConnected(true);
      if (import.meta.env.DEV) {
        console.log('[game-socket] connected');
      }
    };
    const handleDisconnect = (reason: string) => {
      setIsGameConnected(false);
      if (import.meta.env.DEV) {
        console.log('[game-socket] disconnected:', reason);
      }
    };
    const handleConnectError = (error: Error) => {
      if (import.meta.env.DEV) {
        console.error('[game-socket] connect_error:', error.message);
      }
    };
    const handleReconnectAttempt = (attempt: number) => {
      if (import.meta.env.DEV) {
        console.log('[game-socket] reconnect_attempt:', attempt);
      }
    };
    const handleReconnect = (attempt: number) => {
      if (import.meta.env.DEV) {
        console.log('[game-socket] reconnected:', attempt);
      }
    };

    gameSocket.on('connect', handleConnect);
    gameSocket.on('disconnect', handleDisconnect);
    gameSocket.on('connect_error', handleConnectError);
    gameSocket.io.on('reconnect_attempt', handleReconnectAttempt);
    gameSocket.io.on('reconnect', handleReconnect);

    if (!gameSocket.connected) {
      gameSocket.connect();
    }

    return () => {
      gameSocket.off('connect', handleConnect);
      gameSocket.off('disconnect', handleDisconnect);
      gameSocket.off('connect_error', handleConnectError);
      gameSocket.io.off('reconnect_attempt', handleReconnectAttempt);
      gameSocket.io.off('reconnect', handleReconnect);
    };
  }, [token, gameSocket]);

  return (
    <GameSocketContext.Provider value={{ gameSocket, isGameConnected }}>
      {children}
    </GameSocketContext.Provider>
  );
};

export const useGameSocket = () => {
  const context = useContext(GameSocketContext);
  return context || { gameSocket: null, isGameConnected: false };
};
