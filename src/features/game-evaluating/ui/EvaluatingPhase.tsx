import { useEffect } from 'react';

import { GameCanvas } from '@/entities/drawing';
import { useEvaluating } from '../model/useEvaluating';
import { EvaluatingNavigation } from './EvaluatingNavigation';
import { EvaluatingRating } from './EvaluatingRating';

interface EvaluatingPhaseProps {
  onProgressChange?: (progress: {
    allRated: boolean;
    completedCount: number;
    totalCount: number;
    readyCount: number;
    totalActiveCount: number;
  }) => void;
}

export const EvaluatingPhase = ({ onProgressChange }: EvaluatingPhaseProps) => {
  const {
    hasDrawings,
    currentOrder,
    completedCount,
    totalDrawings,
    currentDrawing,
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
  } = useEvaluating();

  useEffect(() => {
    onProgressChange?.({
      allRated,
      completedCount,
      totalCount: totalDrawings,
      readyCount,
      totalActiveCount,
    });
  }, [
    allRated,
    completedCount,
    totalDrawings,
    readyCount,
    totalActiveCount,
    onProgressChange,
  ]);

  if (!hasDrawings || !currentDrawing) {
    return (
      <div className="w-3/5 h-4/5 flex items-center justify-center text-center text-gray-500 bg-gray-50 mx-6 rounded-xl border border-dashed border-gray-300">
        평가할 그림을 불러오는 중이거나 아직 준비되지 않았어요.
      </div>
    );
  }

  return (
    <>
      <div className="absolute -top-12 left-6 z-30 flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-700">평가 작품</span>
      </div>
      <div className="absolute -top-12 left-1/2 z-30 -translate-x-1/2">
        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
          {currentOrder}/{totalDrawings}
        </span>
      </div>

      <EvaluatingNavigation
        onPrev={handlePrev}
        onNext={handleNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

      <GameCanvas readOnly={true} lines={currentDrawing.drawData.lines} />

      <EvaluatingRating
        displayScore={displayScore}
        onRate={handleRate}
        onHoverScore={setHoverScore}
      />
    </>
  );
};
