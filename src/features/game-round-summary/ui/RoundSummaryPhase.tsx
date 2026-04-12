import { GameCanvas } from '@/entities/drawing';
import { useRoundSummary } from '../model/useRoundSummary';
import { RoundSummaryNavigation } from './RoundSummaryNavigation';
import { RoundSummaryDetails } from './RoundSummaryDetails';

export const RoundSummaryPhase = () => {
  const { rankings, hasLiveContext, selectedRank, currentResult, handleRankSelect } =
    useRoundSummary();
  // 자신의 그림은 자신이 평가하지 않으므로 평가 인원은 (참가자 수 - 1)
  const evaluatorCount = Math.max((rankings?.length ?? 0) - 1, 1);

  if (!hasLiveContext && !import.meta.env.DEV) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-500">
        결과를 불러오는 중...
      </div>
    );
  }

  if (!currentResult) return null;

  const displayScore = currentResult.score / evaluatorCount;

  return (
    <>
      <RoundSummaryNavigation
        rankings={rankings}
        selectedRank={selectedRank}
        onSelect={handleRankSelect}
      />

      <GameCanvas readOnly={true} lines={currentResult.drawData.lines} />

      <RoundSummaryDetails
        drawData={currentResult.drawData}
        score={displayScore}
      />
    </>
  );
};
