import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DrawData } from '@/entities/drawing';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import { SOCKET_EVENTS } from '@/shared/api/socket';

export interface EvaluatingDrawing {
  drawingId: string;
  drawData: DrawData;
}

export const useEvaluating = () => {
  const { gameSocket } = useGameSocket();

  const [drawings, setDrawings] = useState<EvaluatingDrawing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  // game:startEvaluation 수신 → 그림 목록 세팅
  useEffect(() => {
    if (!gameSocket) return;

    const handleStartEvaluation = (payload: { drawings: EvaluatingDrawing[] }) => {
      setDrawings(payload.drawings);
      setCurrentIndex(0);
      setScores({});
      setHoverScore(null);
    };

    gameSocket.on(SOCKET_EVENTS.GAME_START_EVALUATION, handleStartEvaluation);

    return () => {
      gameSocket.off(SOCKET_EVENTS.GAME_START_EVALUATION, handleStartEvaluation);
    };
  }, [gameSocket]);

  const currentDrawing = drawings[currentIndex] ?? null;
  const currentId = currentDrawing?.drawingId ?? '';
  const savedScore = scores[currentId] ?? 0;

  // 화면에 보여줄 점수 (저장된 점수가 있으면 hover 무시)
  const displayScore = savedScore > 0 ? savedScore : hoverScore ?? 0;

  // 전체 그림에 점수가 입력됐는지 여부
  const allRated = useMemo(() => {
    if (drawings.length === 0) return false;
    return drawings.every((d) => (scores[d.drawingId] ?? 0) > 0);
  }, [drawings, scores]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? drawings.length - 1 : prev - 1));
    setHoverScore(null);
  }, [drawings.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === drawings.length - 1 ? 0 : prev + 1));
    setHoverScore(null);
  }, [drawings.length]);

  // 별점 클릭 → 로컬 저장 + 서버 전송
  const handleRate = useCallback(
    (scoreValue: number) => {
      if (!currentId) return;

      setScores((prev) => ({ ...prev, [currentId]: scoreValue }));

      gameSocket?.emit(SOCKET_EVENTS.GAME_SUBMIT_EVALUATION, {
        drawingId: currentId,
        score: scoreValue,
      });
    },
    [currentId, gameSocket],
  );

  return {
    currentDrawing,
    displayScore,
    allRated,
    handlePrev,
    handleNext,
    handleRate,
    setHoverScore,
  };
};
