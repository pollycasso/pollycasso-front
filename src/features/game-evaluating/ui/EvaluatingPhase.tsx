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
    currentDrawing,
    displayScore,
    allRated,
    handlePrev,
    handleNext,
    handleRate,
    setHoverScore,
  } = useEvaluating();

  // allRated 상태 변화를 GameWidget에 알림
  useEffect(() => {
    onAllRatedChange?.(allRated);
  }, [allRated, onAllRatedChange]);

  if (!currentDrawing) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
        그림을 불러오는 중...
      </div>
    );
  }

  return (
    <>
      <EvaluatingNavigation onPrev={handlePrev} onNext={handleNext} />

      <GameCanvas readOnly={true} lines={currentDrawing.drawData.lines} />

      <EvaluatingRating
        displayScore={displayScore}
        onRate={handleRate}
        onHoverScore={setHoverScore}
      />
    </>
  );
};
