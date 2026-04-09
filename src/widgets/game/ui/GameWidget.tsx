import { useCallback, useMemo, useRef } from 'react';

import { useAuthStore } from '@/entities/user';
import {
  GameHeader,
  GameSubmitButton,
  GameTimer,
  InventoryPanel,
  PlayerSidebar,
  ThemeSelector,
} from '@/features/game';
import { DrawingPhase } from '@/features/game-drawing';
import { EvaluatingPhase } from '@/features/game-evaluating';
import { RoundSummaryPhase } from '@/features/game-round-summary';
import { FinishedPhase } from '@/features/game-finished';
import { PHASE_TIME } from '@/shared/model';
import { useGameState } from '../model/useGameState';
import { useGameSubmission } from '../model/useGameSubmission';
import { useThemeInput } from '../model/useThemeInput';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import { SOCKET_EVENTS } from '@/shared/api/socket';

interface GameWidgetProps {
  playerMap: Record<string, number>;
}

const GameWidget = ({ playerMap }: GameWidgetProps) => {
  const {
    status: phase,
    players,
    endsAt,
    phaseContext,
    inventory,
    currentTheme,
    isMeReady,
  } = useGameState();

  const { gameSocket } = useGameSocket();
  const { user } = useAuthStore();

  const { completedCount, totalCount, isSubmitting, submitDrawing } =
    useGameSubmission();

  // EVALUATING 단계에서 모든 그림 채점 완료 여부 추적
  const allRatedRef = useRef(false);
  const handleAllRatedChange = useCallback((allRated: boolean) => {
    allRatedRef.current = allRated;
  }, []);

  const syncedPlayers = useMemo(() => {
    if (!players) return [];

    return players.map((player) => ({
      ...player,
      roomMemberId: playerMap[String(player.userId)] || null,
    }));
  }, [players, playerMap]);

  const isMyTurn = useMemo(() => {
    return (
      phaseContext?.kind === 'THEME_SELECTING' &&
      phaseContext.selectorId === Number(user?.id)
    );
  }, [phaseContext, user]);

  const { localInput, handleInputChange, handleRandomTheme } =
    useThemeInput(isMyTurn);

  const handleComplete = useCallback(() => {
    if (phase === 'THEME_SELECTING') {
      if (!isMyTurn) return;

      if (!localInput.trim()) {
        alert('주제를 입력해주세요!');
        return;
      }

      gameSocket?.emit(SOCKET_EVENTS.GAME_FINALIZE, { value: localInput });
      return;
    }

    submitDrawing();
  }, [phase, isMyTurn, localInput, gameSocket, submitDrawing]);

  const totalTime = useMemo(() => {
    switch (phase) {
      case 'THEME_SELECTING':
        return PHASE_TIME.THEME_SELECT;
      case 'DRAWING':
        return PHASE_TIME.DRAWING;
      case 'EVALUATING':
        return PHASE_TIME.EVALUATING;
      case 'ROUND_SUMMARY':
        return PHASE_TIME.ROUND_SUMMARY;
      case 'FINISHED':
        return PHASE_TIME.FINISHED;
      default:
        return PHASE_TIME.DEFAULT;
    }
  }, [phase]);

  const isSubmitDisabled = useMemo(() => {
    if (phase === 'THEME_SELECTING') {
      if (!isMyTurn) return true;
      return !localInput.trim();
    }

    if (phase === 'DRAWING') {
      return isMeReady || isSubmitting;
    }

    return false;
  }, [phase, isMyTurn, localInput, isMeReady, isSubmitting]);

  const renderGameContent = () => {
    switch (phase) {
      case 'THEME_SELECTING':
        return (
          <ThemeSelector
            isSelector={isMyTurn}
            inputValue={localInput}
            onChange={handleInputChange}
            onRandom={handleRandomTheme}
          />
        );

      case 'DRAWING':
        return <DrawingPhase />;

      case 'EVALUATING':
        return <EvaluatingPhase onAllRatedChange={handleAllRatedChange} />;

      case 'ROUND_SUMMARY':
        return <RoundSummaryPhase />;

      case 'FINISHED':
        return <FinishedPhase />;

      default:
        return <div className="text-gray-400">로딩 중...</div>;
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-between gap-16 overflow-hidden px-20 py-4 font-ssrm">
      <PlayerSidebar players={syncedPlayers} currentUserId={user?.id || ''} />

      <main className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <GameTimer
          endsAt={endsAt}
          totalTime={totalTime}
          className="absolute top-24 right-16 z-10"
        />

        <GameHeader currentTheme={currentTheme} />

        <div className="relative flex flex-1 items-start justify-center bg-white pt-0">
          {renderGameContent()}
        </div>
      </main>

      <aside className="flex h-full flex-col justify-center gap-y-20">
        <InventoryPanel inventory={inventory} />
        <GameSubmitButton
          onComplete={handleComplete}
          completedCount={completedCount}
          totalCount={totalCount}
          isReady={phase === 'THEME_SELECTING' ? false : isMeReady}
          showBadge={phase !== 'THEME_SELECTING'}
          disabled={isSubmitDisabled}
        />
      </aside>
    </div>
  );
};

export default GameWidget;
