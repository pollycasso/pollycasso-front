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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [hoverScore, setHoverScore] = useState<number | null>(null);

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
    setHoverScore(null);
  };

  const handleNext = () => {
    if (drawingIds.length <= 1) return;
    setCurrentIndex((prev) => (prev === drawingIds.length - 1 ? 0 : prev + 1));
    setHoverScore(null);
  };

  const handleRate = (scoreValue: number) => {
    if (!currentId) return;
    setScores((prev) => ({ ...prev, [currentId]: scoreValue }));
  };

  return {
    hasDrawings,
    currentIndex,
    totalDrawings: drawingIds.length,
    currentDrawing,
    displayScore,
    handlePrev,
    handleNext,
    handleRate,
    setHoverScore,
  };
};
