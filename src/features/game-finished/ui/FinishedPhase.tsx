import { createPortal } from 'react-dom';

import type { FinishContext } from '@/shared/model';
import { useRoomStore } from '@/shared/model/roomStore';
import { useLockBodyScroll } from '@/shared/model/useLockBodyScroll';

import { useGameFinished } from '../model/useGameFinished';
import { SoloGameResult } from './SoloGameResult';
import { TeamGameResult } from './TeamGameResult';

export const FinishedPhase = () => {
  const { players, phaseContext, teamScore, settings } = useRoomStore(
    (state) => state.roomState,
  );

  const finishContext =
    phaseContext?.kind === 'FINISHED' ? (phaseContext as FinishContext) : null;

  const results = useGameFinished(players, finishContext);

  const isTeamMode = settings.gameMode === 'TEAM';

  useLockBodyScroll();

  return createPortal(
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/90 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500 pb-24 overflow-y-auto">
      {isTeamMode ? (
        <TeamGameResult results={results} teamScore={teamScore} />
      ) : (
        <SoloGameResult results={results} />
      )}
    </div>,
    document.body,
  );
};
