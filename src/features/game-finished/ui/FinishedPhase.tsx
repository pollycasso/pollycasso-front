import { createPortal } from 'react-dom';

import type { FinishContext } from '@/shared/model';
import {
  MOCK_FINISHED_ROOM_STATE,
  MOCK_TEAM_FINISHED_ROOM_STATE,
} from '@/mocks/finished.mock';
import { useLockBodyScroll } from '@/shared/model/useLockBodyScroll';

import { useGameFinished } from '../model/useGameFinished';
import { SoloGameResult } from './SoloGameResult';
import { TeamGameResult } from './TeamGameResult';

export const FinishedPhase = () => {
  const currentRoomState = MOCK_TEAM_FINISHED_ROOM_STATE;

  const { players, phaseContext, settings, teamScore } = currentRoomState;

  const finishContext = phaseContext as FinishContext;

  const results = useGameFinished(players, finishContext);

  const isTeamMode = true;

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
