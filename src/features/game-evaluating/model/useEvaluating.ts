import { useEffect, useMemo, useRef, useState } from 'react';

import { SOCKET_EVENTS } from '@/shared/api/socket';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import type { SystemNotification } from '@/shared/model';
import { useGameState } from '@/widgets/game/model/useGameState';

export const useEvaluating = () => {
  const { gameSocket } = useGameSocket();
  const { evaluatingContext, status } = useGameState();

  const drawings = useMemo(
    () => evaluatingContext?.drawings ?? {},
    [evaluatingContext],
  );
  const drawingIds = useMemo(() => Object.keys(drawings), [drawings]);
  const drawingSignature = useMemo(() => drawingIds.join('|'), [drawingIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const pendingEvaluationRef = useRef<{
    drawingId: string;
    previousScore?: number;
  } | null>(null);

  useEffect(() => {
    const activeDrawingIds = drawingSignature ? drawingSignature.split('|') : [];

    setCurrentIndex(0);
    setHoverScore(null);

    setScores((prev) => {
      if (activeDrawingIds.length === 0) return {};

      const nextEntries = Object.entries(prev).filter(([id]) =>
        activeDrawingIds.includes(id),
      );
      return Object.fromEntries(nextEntries);
    });
  }, [drawingSignature]);

  useEffect(() => {
    if (status === 'EVALUATING') return;
    pendingEvaluationRef.current = null;
  }, [status]);

  useEffect(() => {
    if (!gameSocket) return;

    const rollbackCodes = new Set([
      'SELF_EVALUATION_NOT_ALLOWED',
      'DRAWING_ID_INVALID',
      'INVALID_SCORE',
    ]);

    const handleNotification = (payload: SystemNotification) => {
      if (!payload || payload.status < 400) return;
      if (!rollbackCodes.has(payload.code)) return;

      const pending = pendingEvaluationRef.current;
      if (!pending) return;

      setScores((prev) => {
        const next = { ...prev };

        if (typeof pending.previousScore === 'number' && pending.previousScore > 0) {
          next[pending.drawingId] = pending.previousScore;
        } else {
          delete next[pending.drawingId];
        }

        return next;
      });

      pendingEvaluationRef.current = null;
    };

    gameSocket.on(SOCKET_EVENTS.SYSTEM_NOTIFICATION, handleNotification);

    return () => {
      gameSocket.off(SOCKET_EVENTS.SYSTEM_NOTIFICATION, handleNotification);
    };
  }, [gameSocket]);

  const hasDrawings = drawingIds.length > 0;
  const currentId = hasDrawings ? drawingIds[currentIndex] : null;
  const currentDrawing = currentId ? drawings[currentId] : null;
  const savedScore = currentId ? (scores[currentId] ?? 0) : 0;

  const displayScore = savedScore > 0 ? savedScore : hoverScore || 0;

  const allRated = useMemo(() => {
    if (drawingIds.length === 0) return false;
    return drawingIds.every((id) => (scores[id] ?? 0) > 0);
  }, [drawingIds, scores]);
  const completedCount = useMemo(
    () => drawingIds.filter((id) => (scores[id] ?? 0) > 0).length,
    [drawingIds, scores],
  );

  const readyCount =
    evaluatingContext?.readySummary?.readyCount ??
    evaluatingContext?.readyUserIds.length ??
    0;
  const totalActiveCount =
    evaluatingContext?.readySummary?.totalCount ??
    evaluatingContext?.activeUserIds.length ??
    0;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < drawingIds.length - 1;

  const handlePrev = () => {
    if (!canGoPrev) return;
    setCurrentIndex((prev) => prev - 1);
    setHoverScore(null);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setCurrentIndex((prev) => prev + 1);
    setHoverScore(null);
  };

  const handleRate = (scoreValue: number) => {
    if (!currentId) return;
    if (status !== 'EVALUATING') return;

    pendingEvaluationRef.current = {
      drawingId: currentId,
      previousScore: scores[currentId],
    };
    setScores((prev) => ({ ...prev, [currentId]: scoreValue }));

    gameSocket?.emit(SOCKET_EVENTS.GAME_SUBMIT_EVALUATION, {
      drawingId: currentId,
      score: scoreValue,
    });
  };

  return {
    hasDrawings,
    currentIndex,
    totalDrawings: drawingIds.length,
    completedCount,
    currentOrder: drawingIds.length === 0 ? 0 : currentIndex + 1,
    currentDrawing: currentId && currentDrawing ? { drawingId: currentId, drawData: currentDrawing } : null,
    displayScore,
    allRated,
    readyCount,
    totalActiveCount,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
    handleRate,
    setHoverScore,
  };
};
