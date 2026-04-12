import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useWaitingSocket } from '@/shared/api/socket/WaitingSocketProvider';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';
import { SOCKET_EVENTS } from '@/shared/api/socket';
import type {
  EvaluatingContext,
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
  GAME_UNAUTHORIZED: '인증이 만료되었습니다. 다시 로그인해주세요.',
  GAME_STATE_NOT_FOUND: '게임 상태를 찾을 수 없습니다. 방에 다시 입장해주세요.',
  INVALID_PHASE: '현재 단계에서는 요청할 수 없습니다.',
  EVALUATION_INCOMPLETE: '모든 그림을 평가해야 준비 완료할 수 있습니다.',
  SELF_EVALUATION_NOT_ALLOWED: '자신의 그림은 평가할 수 없습니다.',
  DRAWING_ID_INVALID: '유효하지 않은 그림입니다. 목록을 다시 확인해주세요.',
  INVALID_SCORE: '점수는 0~10 사이 정수만 가능합니다.',
  GAME_ACCESS_DENIED: '게임 참가 권한이 없습니다.',
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
    EvaluatingContext['drawings'] | null
  >(null);

  const roomState = useRoomStore((state) => state.roomState);
  const setRoomState = useRoomStore((state) => state.setRoomState);

  const [playerMap, setPlayerMap] = useState<Record<string, number>>({});
  const [waitingJoined, setWaitingJoined] = useState(false);
  const [waitingRoomId, setWaitingRoomId] = useState<number | null>(null);
  const [gameConnected, setGameConnected] = useState(Boolean(gameSocket?.connected));
  const [gameJoinPending, setGameJoinPending] = useState(false);
  const [gameJoinedRoomId, setGameJoinedRoomId] = useState<number | null>(null);

  const { status, endsAt } = roomState;
  const targetRoomId = Number(roomId);
  const hasValidTargetRoomId = Number.isFinite(targetRoomId);

  useEffect(() => {
    setWaitingJoined(false);
    setWaitingRoomId(null);
    setGameJoinPending(false);
    setGameJoinedRoomId(null);
  }, [targetRoomId]);

  useEffect(() => {
    setGameConnected(Boolean(gameSocket?.connected));
  }, [gameSocket]);

  useEffect(() => {
    if (!gameSocket || !hasValidTargetRoomId) return;

    const canEmitGameJoin =
      waitingJoined === true &&
      waitingRoomId === targetRoomId &&
      gameConnected === true &&
      gameJoinPending !== true &&
      gameJoinedRoomId !== targetRoomId;

    if (!canEmitGameJoin) return;

    setGameJoinPending(true);
    gameSocket.emit(SOCKET_EVENTS.GAME_JOIN, { roomId: targetRoomId });
  }, [
    gameSocket,
    gameConnected,
    gameJoinPending,
    gameJoinedRoomId,
    hasValidTargetRoomId,
    targetRoomId,
    waitingJoined,
    waitingRoomId,
  ]);

  useEffect(() => {
    if (!waitingSocket && !gameSocket) return;

    interface UpdateGameStatePayload {
      phase: RoomStatus;
      currentTheme?: string | null;
      phaseContext?: PhaseContext | null;
      endsAt: number | null;
      totalScores?: Record<string, number>;
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

    interface UpdateReadySummaryPayload {
      phase: 'DRAWING' | 'EVALUATING' | 'ROUND_SUMMARY';
      readyCount: number;
      totalCount: number;
      allReady: boolean;
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
    };

    const handleWaitingJoinSuccess = (
      payload: Pick<RoomState, 'status' | 'endsAt'> & { roomId: number },
    ) => {
      syncStatus(payload);
      setWaitingJoined(true);
      setWaitingRoomId(payload.roomId);
    };

    const buildEvaluatingContext = (
      prevPhaseContext: PhaseContext,
      nextPhaseContext?: PhaseContext | null,
    ): EvaluatingContext => {
      const prevEvaluatingContext =
        prevPhaseContext?.kind === 'EVALUATING' ? prevPhaseContext : null;
      const incomingEvaluatingContext =
        nextPhaseContext?.kind === 'EVALUATING' ? nextPhaseContext : null;

      return {
        kind: 'EVALUATING',
        activeUserIds:
          incomingEvaluatingContext?.activeUserIds ??
          prevEvaluatingContext?.activeUserIds ??
          [],
        readyUserIds:
          incomingEvaluatingContext?.readyUserIds ??
          prevEvaluatingContext?.readyUserIds ??
          [],
        drawings:
          pendingEvaluationDrawingsRef.current ??
          incomingEvaluatingContext?.drawings ??
          prevEvaluatingContext?.drawings ??
          {},
        readySummary:
          incomingEvaluatingContext?.readySummary ??
          prevEvaluatingContext?.readySummary,
      };
    };

    const syncPhase = (payload: UpdateGameStatePayload) => {
      if (!payload?.phase) return;
      if (import.meta.env.DEV) {
        console.log('[room:updateGameState]', payload);
      }
      if (payload.phase !== 'EVALUATING') {
        pendingEvaluationDrawingsRef.current = null;
      }

      setRoomState((prev) => {
        const isPhaseChanged = prev.status !== payload.phase;
        const snapshotReadyMap = new Map(
          payload.snapshot?.players.map((player) => [
            String(player.userId),
            player.isReady,
          ]) ?? [],
        );
        const nextPhaseContext =
          payload.phase === 'EVALUATING'
            ? buildEvaluatingContext(prev.phaseContext, payload.phaseContext)
            : payload.phaseContext ??
              (payload.phase === 'DRAWING' && payload.currentTheme
                ? {
                    kind: 'DRAWING' as const,
                    currentTheme: payload.currentTheme,
                  }
                : isPhaseChanged
                  ? null
                  : prev.phaseContext ?? null);

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
          totalScores: payload.totalScores ?? prev.totalScores,
          phaseContext: nextPhaseContext,
          players,
        };
      });

      if (payload.roomMemberIdByUserId) {
        setPlayerMap(payload.roomMemberIdByUserId);
      }
    };

    const handleGameConnect = () => {
      setGameConnected(true);
    };

    const handleGameDisconnect = () => {
      setGameConnected(false);
      setGameJoinPending(false);
      setGameJoinedRoomId(null);
    };

    const handleGameJoined = (payload: { roomId: number }) => {
      setGameJoinPending(false);
      setGameJoinedRoomId(payload.roomId);
    };

    const handleGameNotification = (payload: SystemNotification) => {
      if (payload.code === 'GAME_ACCESS_DENIED') {
        setGameJoinPending(false);
      }

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

        if (payload.status === 401 || payload.code === 'GAME_UNAUTHORIZED') {
          gameSocket?.disconnect();
          waitingSocket?.disconnect();
          navigate('/login');
        }
      } else {
        showToast.info(message);
      }
    };

    const handleStartEvaluation = (payload: StartEvaluationPayload) => {
      if (import.meta.env.DEV) {
        console.log('[game:startEvaluation]', payload);
      }

      const drawings = Object.fromEntries(
        (payload.drawings ?? []).map((item) => [
          item.drawingId,
          { lines: item.drawData?.lines ?? [] },
        ]),
      );

      pendingEvaluationDrawingsRef.current = drawings;

      setRoomState((prev) => {
        if (prev.status !== 'EVALUATING') return prev;

        const currentContext =
          prev.phaseContext?.kind === 'EVALUATING' ? prev.phaseContext : null;

        return {
          ...prev,
          phaseContext: {
            kind: 'EVALUATING',
            activeUserIds: currentContext?.activeUserIds ?? [],
            readyUserIds: currentContext?.readyUserIds ?? [],
            drawings,
            readySummary: currentContext?.readySummary,
          },
        };
      });
    };

    const handleUpdateReadySummary = (payload: UpdateReadySummaryPayload) => {
      if (!payload) return;

      setRoomState((prev) => {
        if (payload.phase === 'EVALUATING') {
          if (prev.phaseContext?.kind !== 'EVALUATING') return prev;

          return {
            ...prev,
            phaseContext: {
              ...prev.phaseContext,
              readySummary: {
                readyCount: payload.readyCount,
                totalCount: payload.totalCount,
                allReady: payload.allReady,
              },
            },
          };
        }

        if (payload.phase === 'ROUND_SUMMARY') {
          if (prev.phaseContext?.kind !== 'ROUND_SUMMARY') return prev;

          return {
            ...prev,
            phaseContext: {
              ...prev.phaseContext,
              readySummary: {
                readyCount: payload.readyCount,
                totalCount: payload.totalCount,
                allReady: payload.allReady,
              },
            },
          };
        }

        return prev;
      });
    };

    const handleUpdatePlayer = (payload: UpdatePlayerPayload) => {
      if (!payload?.userId || !payload?.changes) return;

      setRoomState((prev) => ({
        ...prev,
        phaseContext:
          prev.phaseContext?.kind === 'EVALUATING' &&
          typeof payload.changes.isReady === 'boolean'
            ? {
                ...prev.phaseContext,
                readyUserIds: payload.changes.isReady
                  ? Array.from(
                      new Set([
                        ...prev.phaseContext.readyUserIds,
                        String(payload.userId),
                      ]),
                    )
                  : prev.phaseContext.readyUserIds.filter(
                      (id) => id !== String(payload.userId),
                    ),
              }
            : prev.phaseContext?.kind === 'ROUND_SUMMARY' &&
                typeof payload.changes.isReady === 'boolean'
              ? {
                  ...prev.phaseContext,
                  readyUserIds: (() => {
                    if (prev.status !== 'ROUND_SUMMARY') {
                      return prev.phaseContext.readyUserIds;
                    }

                    const numericUserId = Number(payload.userId);
                    if (!Number.isFinite(numericUserId)) {
                      return prev.phaseContext.readyUserIds;
                    }

                    return payload.changes.isReady
                      ? Array.from(
                          new Set([
                            ...prev.phaseContext.readyUserIds,
                            numericUserId,
                          ]),
                        )
                      : prev.phaseContext.readyUserIds.filter(
                          (id) => id !== numericUserId,
                        );
                  })(),
                }
            : prev.phaseContext,
        players: prev.players.map((player) =>
          String(player.userId) === String(payload.userId)
            ? { ...player, ...payload.changes }
            : player,
        ),
      }));
    };

    waitingSocket?.on('room:joinSuccess', handleWaitingJoinSuccess);
    waitingSocket?.on('room:stateSync', syncStatus);
    waitingSocket?.on('room:updateGameState', syncPhase);

    gameSocket?.on(SOCKET_EVENTS.CONNECT, handleGameConnect);
    gameSocket?.on(SOCKET_EVENTS.DISCONNECT, handleGameDisconnect);
    gameSocket?.on(SOCKET_EVENTS.GAME_JOINED, handleGameJoined);
    gameSocket?.on(SOCKET_EVENTS.SYSTEM_NOTIFICATION, handleGameNotification);
    gameSocket?.on(SOCKET_EVENTS.GAME_START_EVALUATION, handleStartEvaluation);
    gameSocket?.on(SOCKET_EVENTS.UPDATE_READY_SUMMARY, handleUpdateReadySummary);
    gameSocket?.on(SOCKET_EVENTS.UPDATE_PLAYER, handleUpdatePlayer);
    gameSocket?.on('room:updateGameState', syncPhase);

    return () => {
      waitingSocket?.off('room:joinSuccess', handleWaitingJoinSuccess);
      waitingSocket?.off('room:stateSync', syncStatus);
      waitingSocket?.off('room:updateGameState', syncPhase);

      gameSocket?.off(SOCKET_EVENTS.CONNECT, handleGameConnect);
      gameSocket?.off(SOCKET_EVENTS.DISCONNECT, handleGameDisconnect);
      gameSocket?.off(SOCKET_EVENTS.GAME_JOINED, handleGameJoined);
      gameSocket?.off(
        SOCKET_EVENTS.SYSTEM_NOTIFICATION,
        handleGameNotification,
      );
      gameSocket?.off(
        SOCKET_EVENTS.GAME_START_EVALUATION,
        handleStartEvaluation,
      );
      gameSocket?.off(
        SOCKET_EVENTS.UPDATE_READY_SUMMARY,
        handleUpdateReadySummary,
      );
      gameSocket?.off(SOCKET_EVENTS.UPDATE_PLAYER, handleUpdatePlayer);
      gameSocket?.off('room:updateGameState', syncPhase);
    };
  }, [
    waitingSocket,
    gameSocket,
    setRoomState,
    navigate,
    hasValidTargetRoomId,
    targetRoomId,
  ]);

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
