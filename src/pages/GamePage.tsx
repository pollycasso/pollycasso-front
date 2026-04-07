import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useWaitingSocket } from '@/shared/api/socket/WaitingSocketProvider';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import type { PhaseContext, RoomState, RoomStatus } from '@/shared/model';
import { useRoomStore } from '@/shared/model/roomStore';
import { GameWidget } from '@/widgets/game';
import { LoadingWidget } from '@/widgets/loading';
import { RoomWidget } from '@/widgets/waiting';

const GAME_PHASE_STATUSES: RoomStatus[] = [
  'THEME_SELECTING',
  'DRAWING',
  'EVALUATING',
  'ROUND_SUMMARY',
  'FINISHED',
];

const GamePage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { waitingSocket } = useWaitingSocket();
  const { gameSocket } = useGameSocket();

  const roomState = useRoomStore((state) => state.roomState);
  const setRoomState = useRoomStore((state) => state.setRoomState);

  const [playerMap, setPlayerMap] = useState<Record<string, number>>({});

  const { status, endsAt } = roomState;

  useEffect(() => {
    if (!waitingSocket) return;

    interface UpdateGameStatePayload {
      phase: RoomStatus;
      phaseContext: PhaseContext | null;
      endsAt: number | null;
      roomMemberIdByUserId?: Record<string, number>;
    }

    const syncStatus = (payload: Pick<RoomState, 'status' | 'endsAt'>) => {
      if (!payload?.status) return;

      const nextStatus = payload.status;
      const nextEndsAt = payload.endsAt ?? null;

      setRoomState((prev) => ({
        ...prev,
        status: nextStatus,
        endsAt: nextEndsAt,
      }));

      if (gameSocket && roomId) {
        gameSocket.emit('game:join', { roomId: Number(roomId) });
      }
    };

    const syncPhase = (payload: UpdateGameStatePayload) => {
      if (!payload?.phase) return;

      setRoomState((prev) => {
        const isPhaseChanged = prev.status !== payload.phase;

        return {
          ...prev,
          status: payload.phase,
          endsAt: payload.endsAt ?? null,
          phaseContext: payload.phaseContext ?? null,
          players: isPhaseChanged
            ? prev.players.map((player) => ({
              ...player,
              isReady: false,
            }))
            : prev.players,
        };
      });

      if (payload.roomMemberIdByUserId) {
        setPlayerMap(payload.roomMemberIdByUserId);
      }
    };

    waitingSocket.on('room:joinSuccess', syncStatus);
    waitingSocket.on('room:stateSync', syncStatus);
    waitingSocket.on('room:updateGameState', syncPhase);

    if (gameSocket) {
      gameSocket.on('room:updateGameState', syncPhase);
    }

    return () => {
      waitingSocket.off('room:joinSuccess', syncStatus);
      waitingSocket.off('room:stateSync', syncStatus);
      waitingSocket.off('room:updateGameState', syncPhase);

      if (gameSocket) {
        gameSocket.off('room:updateGameState', syncPhase);
      }
    };
  }, [waitingSocket, gameSocket, roomId, setRoomState]);

  let widget = <LoadingWidget endsAt={endsAt} />;

  if (status === 'WAITING') {
    widget = <RoomWidget />;
  } else if (status === 'LOADING') {
    widget = <LoadingWidget endsAt={endsAt} />;
  } else if (GAME_PHASE_STATUSES.includes(status)) {
    widget = <GameWidget playerMap={playerMap} />;
  }

  const handleEmergencyLeave = () => {
    waitingSocket?.emit('room:leave');
    navigate('/');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleEmergencyLeave}
        className="fixed top-5 right-5 z-[9999] rounded-lg border border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-md transition-colors hover:bg-gray-100"
      >
        방 나가기
      </button>
      {widget}
    </>
  );
};

export default GamePage;