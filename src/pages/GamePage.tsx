import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useWaitingSocket } from '@/shared/api/socket/WaitingSocketProvider';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import { SOCKET_EVENTS } from '@/shared/api/socket';
import type {
  PhaseContext,
  RoomState,
  RoomStatus,
  SystemNotification,
} from '@/shared/model';
import { useRoomStore } from '@/shared/model/roomStore';
import { showToast } from '@/shared/ui/Toast';
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

const GAME_NOTIFICATION_MESSAGES: Record<string, string> = {
  INVALID_INPUT: '요청 형식이 올바르지 않습니다.',
  GAME_CONTEXT_INVALID: '게임 컨텍스트가 유효하지 않습니다.',
  DRAWING_CONTEXT_MISSING: '드로잉 컨텍스트를 찾을 수 없습니다.',
  USER_NOT_ACTIVE: '현재 라운드의 활성 플레이어가 아닙니다.',
};

type EvaluationLine = {
  tool: 'pencil' | 'brush' | 'neon' | 'bucket' | 'eraser';
  color: string;
  size: number;
  points: number[];
};

const GamePage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { waitingSocket } = useWaitingSocket();
  const { gameSocket } = useGameSocket();
  const pendingEvaluationDrawingsRef = useRef<
    Record<string, { lines: EvaluationLine[] }> | null
  >(null);

  const roomState = useRoomStore((state) => state.roomState);
  const setRoomState = useRoomStore((state) => state.setRoomState);

  const [playerMap, setPlayerMap] = useState<Record<string, number>>({});

  const { status, endsAt } = roomState;

  const emitGameJoin = useCallback(() => {
    if (!gameSocket || !roomId) return;
    const numericRoomId = Number(roomId);
    if (!Number.isFinite(numericRoomId)) return;
    gameSocket.emit(SOCKET_EVENTS.GAME_JOIN, { roomId: numericRoomId });
  }, [gameSocket, roomId]);

  useEffect(() => {
    if (!waitingSocket && !gameSocket) return;

    interface UpdateGameStatePayload {
      phase: RoomStatus;
      currentTheme?: string | null;
      phaseContext?: PhaseContext | null;
      endsAt: number | null;
      roomMemberIdByUserId?: Record<string, number>;
      snapshot?: {
        players: Array<{
          userId: number | string;
          isReady: boolean;
        }>;
        readySummary?: {
          phase: 'DRAWING';
          readyCount: number;
          totalCount: number;
          allReady: boolean;
        };
      };
    }

    interface StartEvaluationPayload {
      drawings: Array<{
        drawingId: string;
        drawData: {
          lines: EvaluationLine[];
        };
      }>;
    }

    interface UpdatePlayerPayload {
      userId: number | string;
      changes: {
        isReady?: boolean;
        isConnected?: boolean;
      };
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

      // waiting 방 입장/동기화 완료 시점에 game 재조인하여
      // 소켓 연결 타이밍 레이스로 인한 조인 누락을 방지한다.
      emitGameJoin();
    };

    const syncPhase = (payload: UpdateGameStatePayload) => {
      if (!payload?.phase) return;

      setRoomState((prev) => {
        const isPhaseChanged = prev.status !== payload.phase;
        const snapshotReadyMap = new Map(
          payload.snapshot?.players.map((player) => [
            String(player.userId),
            player.isReady,
          ]) ?? [],
        );

        const players = prev.players.map((player) => {
          const snapshotReady = snapshotReadyMap.get(String(player.userId));
          if (typeof snapshotReady === 'boolean') {
            return {
              ...player,
              isReady: snapshotReady,
            };
          }

          if (isPhaseChanged) {
            return {
              ...player,
              isReady: false,
            };
          }

          return player;
        });

        return {
          ...prev,
          status: payload.phase,
          endsAt: payload.endsAt ?? null,
          phaseContext:
            payload.phaseContext ??
            (payload.phase === 'EVALUATING' &&
            pendingEvaluationDrawingsRef.current
              ? {
                  kind: 'EVALUATING' as const,
                  drawings: pendingEvaluationDrawingsRef.current,
                }
              : null) ??
            (payload.phase === 'DRAWING' && payload.currentTheme
              ? {
                  kind: 'DRAWING' as const,
                  currentTheme: payload.currentTheme,
                }
              : prev.phaseContext ?? null),
          players,
        };
      });

      if (payload.roomMemberIdByUserId) {
        setPlayerMap(payload.roomMemberIdByUserId);
      }
    };

    const handleGameConnect = () => {
      emitGameJoin();
    };

    const handleGameJoined = (payload: { roomId: number }) => {
      if (String(payload.roomId) !== String(roomId)) {
        emitGameJoin();
      }
    };

    const handleGameNotification = (payload: SystemNotification) => {
      const firstReason = payload.errors?.[0]?.reason;
      const normalizedReason = Array.isArray(firstReason)
        ? firstReason[0]
        : firstReason;
      const message =
        GAME_NOTIFICATION_MESSAGES[payload.code] ||
        payload.message ||
        normalizedReason ||
        payload.code ||
        '게임 서버 처리 중 오류가 발생했습니다.';

      if (payload.status >= 400) {
        showToast.error(message);

        if (payload.status === 401) {
          gameSocket?.disconnect();
          waitingSocket?.disconnect();
          navigate('/login');
        }
      } else {
        showToast.info(message);
      }
    };

    const handleStartEvaluation = (payload: StartEvaluationPayload) => {
      const drawings = Object.fromEntries(
        (payload.drawings ?? []).map((item) => [
          item.drawingId,
          { lines: item.drawData?.lines ?? [] },
        ]),
      );

      pendingEvaluationDrawingsRef.current = drawings;

      setRoomState((prev) => {
        if (prev.status !== 'EVALUATING') return prev;
        return {
          ...prev,
          phaseContext: {
            kind: 'EVALUATING',
            drawings,
          },
        };
      });
    };

    const handleUpdatePlayer = (payload: UpdatePlayerPayload) => {
      if (!payload?.userId || !payload?.changes) return;

      setRoomState((prev) => ({
        ...prev,
        players: prev.players.map((player) =>
          String(player.userId) === String(payload.userId)
            ? { ...player, ...payload.changes }
            : player,
        ),
      }));
    };

    waitingSocket?.on('room:joinSuccess', syncStatus);
    waitingSocket?.on('room:stateSync', syncStatus);
    waitingSocket?.on('room:updateGameState', syncPhase);

    gameSocket?.on(SOCKET_EVENTS.CONNECT, handleGameConnect);
    gameSocket?.on(SOCKET_EVENTS.GAME_JOINED, handleGameJoined);
    gameSocket?.on(SOCKET_EVENTS.SYSTEM_NOTIFICATION, handleGameNotification);
    gameSocket?.on(SOCKET_EVENTS.GAME_START_EVALUATION, handleStartEvaluation);
    gameSocket?.on(SOCKET_EVENTS.UPDATE_PLAYER, handleUpdatePlayer);
    gameSocket?.on('room:updateGameState', syncPhase);

    if (gameSocket?.connected) {
      emitGameJoin();
    }

    return () => {
      waitingSocket?.off('room:joinSuccess', syncStatus);
      waitingSocket?.off('room:stateSync', syncStatus);
      waitingSocket?.off('room:updateGameState', syncPhase);

      gameSocket?.off(SOCKET_EVENTS.CONNECT, handleGameConnect);
      gameSocket?.off(SOCKET_EVENTS.GAME_JOINED, handleGameJoined);
      gameSocket?.off(
        SOCKET_EVENTS.SYSTEM_NOTIFICATION,
        handleGameNotification,
      );
      gameSocket?.off(
        SOCKET_EVENTS.GAME_START_EVALUATION,
        handleStartEvaluation,
      );
      gameSocket?.off(SOCKET_EVENTS.UPDATE_PLAYER, handleUpdatePlayer);
      gameSocket?.off('room:updateGameState', syncPhase);
    };
  }, [waitingSocket, gameSocket, emitGameJoin, setRoomState, navigate]);

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
