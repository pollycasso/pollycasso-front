<<<<<<< HEAD
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
=======
import { useEffect, useMemo, useState } from 'react';

import type { DrawData } from '@/entities/drawing';
import { useGameState } from '@/widgets/game/model/useGameState';

export const useEvaluating = () => {
  const { evaluatingContext } = useGameState();

  const drawings = useMemo(
    () => (evaluatingContext?.drawings ?? {}) as Record<string, DrawData>,
    [evaluatingContext],
  );
  const drawingIds = useMemo(() => Object.keys(drawings), [drawings]);
  const drawingSignature = useMemo(() => drawingIds.join('|'), [drawingIds]);
>>>>>>> 2f27fa6c04cb88a7ff882273b04a81cf9be709cd

  const [drawings, setDrawings] = useState<EvaluatingDrawing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [hoverScore, setHoverScore] = useState<number | null>(null);

<<<<<<< HEAD
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
=======
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

  const hasDrawings = drawingIds.length > 0;
  const currentId = hasDrawings ? drawingIds[currentIndex] : null;
  const currentDrawing = currentId ? drawings[currentId] : null;
  const savedScore = currentId ? (scores[currentId] ?? 0) : 0;

  // 저장된 점수가 있으면 hover 점수보다 우선해서 표시한다.
  const displayScore = savedScore > 0 ? savedScore : hoverScore || 0;

  const handlePrev = () => {
    if (drawingIds.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? drawingIds.length - 1 : prev - 1));
>>>>>>> 2f27fa6c04cb88a7ff882273b04a81cf9be709cd
    setHoverScore(null);
  }, [drawings.length]);

<<<<<<< HEAD
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === drawings.length - 1 ? 0 : prev + 1));
=======
  const handleNext = () => {
    if (drawingIds.length <= 1) return;
    setCurrentIndex((prev) => (prev === drawingIds.length - 1 ? 0 : prev + 1));
>>>>>>> 2f27fa6c04cb88a7ff882273b04a81cf9be709cd
    setHoverScore(null);
  }, [drawings.length]);

<<<<<<< HEAD
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
=======
  const handleRate = (scoreValue: number) => {
    if (!currentId) return;
    setScores((prev) => ({ ...prev, [currentId]: scoreValue }));
  };
>>>>>>> 2f27fa6c04cb88a7ff882273b04a81cf9be709cd

  return {
    hasDrawings,
    currentIndex,
    totalDrawings: drawingIds.length,
    currentDrawing,
    displayScore,
    allRated,
    handlePrev,
    handleNext,
    handleRate,
    setHoverScore,
  };
};
