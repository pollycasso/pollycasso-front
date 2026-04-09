import { useEffect } from 'react';

import { GameCanvas } from '@/entities/drawing';
import { useEvaluating } from '../model/useEvaluating';
import { EvaluatingNavigation } from './EvaluatingNavigation';
import { EvaluatingRating } from './EvaluatingRating';

interface EvaluatingPhaseProps {
  onAllRatedChange?: (allRated: boolean) => void;
}

export const EvaluatingPhase = ({ onAllRatedChange }: EvaluatingPhaseProps) => {
  const {
    hasDrawings,
    totalDrawings,
    currentDrawing,
    displayScore,
    allRated,
    handlePrev,
    handleNext,
    handleRate,
    setHoverScore,
  } = useEvaluating();

  if (!hasDrawings || !currentDrawing) {
    return (
      <div className="w-3/5 h-4/5 flex items-center justify-center text-center text-gray-500 bg-gray-50 mx-6 rounded-xl border border-dashed border-gray-300">
        평가할 그림을 불러오는 중이거나 아직 준비되지 않았어요.
      </div>
    );
  }

  return (
    <>
      <EvaluatingNavigation
        onPrev={handlePrev}
        onNext={handleNext}
        disabled={totalDrawings <= 1}
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
