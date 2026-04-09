import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/entities/user';
import type { Player } from '@/shared/model';
import { useGameState } from './useGameState';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import { SOCKET_EVENTS } from '@/shared/api/socket';
import { showToast } from '@/shared/ui/Toast';

interface GameSubmissionState {
  players: Player[];
  isMeReady: boolean;
  completedCount: number;
  totalCount: number;
  isSubmitting: boolean;
  submitDrawing: () => void;
}

interface ReadySummaryPayload {
  phase: 'DRAWING';
  readyCount: number;
  totalCount: number;
  allReady: boolean;
}

export const useGameSubmission = (): GameSubmissionState => {
  const { gameSocket } = useGameSocket();
  const user = useAuthStore((state) => state.user);
  const { players, status } = useGameState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readySummary, setReadySummary] = useState<ReadySummaryPayload | null>(
    null,
  );

  useEffect(() => {
    if (!gameSocket) return;

    interface UpdateGameStatePayload {
      snapshot?: {
        readySummary?: ReadySummaryPayload;
      };
    }

    const handleReadySummary = (payload: ReadySummaryPayload) => {
      if (payload?.phase !== 'DRAWING') return;
      setReadySummary(payload);
    };

    const handleGameState = (payload: UpdateGameStatePayload) => {
      if (!payload?.snapshot?.readySummary) return;
      setReadySummary(payload.snapshot.readySummary);
    };

    gameSocket.on(SOCKET_EVENTS.UPDATE_READY_SUMMARY, handleReadySummary);
    gameSocket.on(SOCKET_EVENTS.UPDATE_GAME_STATE, handleGameState);

    return () => {
      gameSocket.off(SOCKET_EVENTS.UPDATE_READY_SUMMARY, handleReadySummary);
      gameSocket.off(SOCKET_EVENTS.UPDATE_GAME_STATE, handleGameState);
    };
  }, [gameSocket]);

  useEffect(() => {
    if (status !== 'DRAWING') {
      setReadySummary(null);
      setIsSubmitting(false);
    }
  }, [status]);

  const totalCount = readySummary?.totalCount ?? players.length;

  const completedCount = useMemo(() => {
    if (readySummary) return readySummary.readyCount;
    return players.filter((p) => p.isReady).length;
  }, [players, readySummary]);

  const isMeReady = useMemo(() => {
    if (!user) return false;
    return (
      players.find((p) => String(p.userId) === String(user.id))?.isReady ?? false
    );
  }, [players, user]);

  const submitDrawing = useCallback(() => {
    if (!gameSocket || status !== 'DRAWING' || isSubmitting || isMeReady) return;

    setIsSubmitting(true);
    gameSocket.emit(
      SOCKET_EVENTS.GAME_SUBMIT_DRAWING,
      {},
      (response?: { ok?: boolean; shouldAdvance?: boolean }) => {
        setIsSubmitting(false);

        if (!response) return;
        if (response.ok === false) {
          showToast.error('제출 처리에 실패했습니다. 다시 시도해 주세요.');
        }
      },
    );
  }, [gameSocket, status, isSubmitting, isMeReady]);

  return {
    players,
    isMeReady,
    completedCount,
    totalCount,
    isSubmitting,
    submitDrawing,
  };
};
