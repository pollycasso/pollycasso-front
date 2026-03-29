import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getWaitingSocket } from '@/shared/api/socket';
import type { RoomState, Player, SystemNotification } from '@/shared/model';
import { useAuthStore } from '@/entities/user';
import {
  selectCanStartGame,
  selectMe,
  selectTopBottomTeams,
} from './roomSelectors';
import { ENTRY_ERROR_MESSAGES } from '../constants/messages';
import type { UpdateGameStatePayload } from '../model/types';
import { useSound } from '@/entities/sound';
import { SOUND_ASSETS } from '@/shared/api/sound/assets';
import { SoundManager } from '@/shared/api/sound/manager';

// ── 모듈 레벨 Outfit 캐시 ──
// useRoom 훅이 언마운트(상점/옷장 이동 등)되어도 outfit 정보를 보존합니다.
const OUTFIT_CACHE_KEY = 'lobby_outfit_cache';
const loadOutfitCache = () => {
  try {
    const raw = localStorage.getItem(OUTFIT_CACHE_KEY);
    if (!raw) return new Map<string, any>();
    const obj = JSON.parse(raw);
    return new Map(Object.entries(obj));
  } catch {
    return new Map<string, any>();
  }
};
const saveOutfitCache = (cache: Map<string, any>) => {
  try {
    const obj = Object.fromEntries(cache.entries());
    localStorage.setItem(OUTFIT_CACHE_KEY, JSON.stringify(obj));
  } catch {}
};
const outfitCache = loadOutfitCache();

/** 플레이어 목록에서 outfit이 있는 경우 캐시에 저장 */
const cacheOutfits = (players: Player[]) => {
  let changed = false;
  players.forEach((p) => {
    if (
      p.outfit &&
      typeof p.outfit === 'object' &&
      Object.keys(p.outfit).length > 0
    ) {
      // outfit 값이 전부 null/undefined가 아닌지 확인
      const hasRealValue = Object.values(p.outfit).some(
        (v) => v !== null && v !== undefined,
      );
      // bird_01만 있는 기본 outfit은 캐시에 저장하지 않음
      const isDefaultBirdOnly =
        Object.keys(p.outfit).length === 1 && p.outfit.bird === 'bird_01';
      if (hasRealValue && !isDefaultBirdOnly) {
        outfitCache.set(String(p.userId), { ...p.outfit });
        changed = true;
      }
    }
  });
  if (changed) saveOutfitCache(outfitCache);
};

/** outfit이 비어있는 플레이어에게 캐시된 outfit을 병합 */
const mergeOutfitsFromCache = (players: Player[]): Player[] => {
  let changed = false;
  const merged = players.map((p) => {
    const id = String(p.userId);
    const cached = outfitCache.get(id);
    // outfit이 null/undefined/빈 객체면 무조건 캐시로 덮어씌움
    if (
      !p.outfit ||
      typeof p.outfit !== 'object' ||
      Object.keys(p.outfit).length === 0
    ) {
      if (cached) return { ...p, outfit: cached };
      // 캐시도 없으면 bird_01 기본값
      return { ...p, outfit: { bird: 'bird_01' } };
    }
    // 서버가 보낸 outfit이 있으면 캐시 갱신 (bird_01만 있는 outfit은 캐시에 저장하지 않음)
    const hasRealValue = Object.values(p.outfit).some(
      (v) => v !== null && v !== undefined,
    );
    const isDefaultBirdOnly =
      Object.keys(p.outfit).length === 1 && p.outfit.bird === 'bird_01';
    if (hasRealValue && !isDefaultBirdOnly) {
      outfitCache.set(id, { ...p.outfit });
      changed = true;
      return p;
    } else if (cached) {
      return { ...p, outfit: cached };
    } else {
      // 값이 없으면 bird_01 기본값
      return { ...p, outfit: { bird: 'bird_01' } };
    }
  });
  if (changed) saveOutfitCache(outfitCache);
  return merged;
};

export const useRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const { sfxVolume, isMuted } = useSound();
  const { user } = useAuthStore();

  const waitingSocket = getWaitingSocket();

  const [roomState, setRoomState] = useState<RoomState | null>(null);

  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isFirstJoinRef = useRef(true);
  const lastJoinedRoomIdRef = useRef<string | null>(null);

  const myUserId = user?.id;
  const initialPassword = location.state?.password;

  const joinRoom = useCallback(
    (password?: string) => {
      if (!roomId) return;
      setPasswordError(null);
      waitingSocket.emit('room:join', {
        roomId: Number(roomId),
        ...(password && { password }),
      });
      lastJoinedRoomIdRef.current = roomId;
    },
    [waitingSocket, roomId],
  );

  const emitOutfitRef = useRef<() => void>(undefined);
  const sfxVolumeRef = useRef(sfxVolume);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    sfxVolumeRef.current = sfxVolume;
    isMutedRef.current = isMuted;
  }, [sfxVolume, isMuted]);

  const emitOutfit = useCallback(() => {
    if (!user?.outfit) return;

    const normalize = (outfit: any) => {
      const result: any = {
        bird: 'bird_01',
        accessory: null,
        hat: null,
        top: null,
        bottom: null,
        shoes: null,
        effect: null,
      };

      const extractImage = (val: any) => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object')
          return val.image || val.outfitImage || val.imageUrl || null;
        return null;
      };

      if (Array.isArray(outfit)) {
        outfit.forEach((item: any) => {
          if (!item) return;
          const sub = (item.subCategory || item.category || '').toUpperCase();
          const img = extractImage(item);
          if (!img) return;

          if (sub === 'BIRD' || sub === '새') result.bird = img;
          else if (sub === 'ACC' || sub === 'ACCESSORY' || sub === '액세서리')
            result.accessory = img;
          else if (sub === 'HAT' || sub === '모자') result.hat = img;
          else if (sub === 'TOP' || sub === '상의') result.top = img;
          else if (sub === 'BOTTOM' || sub === '하의') result.bottom = img;
          else if (sub === 'SHOES' || sub === '신발') result.shoes = img;
          else if (sub === 'EFFECT' || sub === '효과') result.effect = img;
        });
      } else if (outfit && typeof outfit === 'object') {
        Object.keys(outfit).forEach((key) => {
          const lowerKey = key.toLowerCase();
          const targetKey = lowerKey === 'acc' ? 'accessory' : lowerKey;
          if (targetKey in result) {
            result[targetKey] = extractImage(outfit[key]);
          }
        });
      }
      return result;
    };

    const mappedOutfit = normalize(user.outfit);
    waitingSocket.emit('room:updateOutfit', { outfit: mappedOutfit });
  }, [user?.outfit, waitingSocket]);

  useEffect(() => {
    emitOutfitRef.current = emitOutfit;
  }, [emitOutfit]);

  useEffect(() => {
    if (!roomId) return;

    const handleJoinSuccess = (initialState: RoomState) => {
      // 서버 응답의 플레이어에 outfit이 누락되어 있으면 캐시에서 복원
      const playersWithOutfits = mergeOutfitsFromCache(initialState.players);
      cacheOutfits(playersWithOutfits);
      setRoomState({ ...initialState, players: playersWithOutfits });
      setIsPasswordRequired(false);
      setPasswordError(null);
      setTimeout(() => emitOutfitRef.current?.(), 500);
    };

    const handleSystemNotification = (response: SystemNotification) => {
      if (response.status >= 400) {
        const koreanMessage =
          ENTRY_ERROR_MESSAGES[response.code] ||
          response.message ||
          ENTRY_ERROR_MESSAGES.DEFAULT;

        switch (response.code) {
          case 'ROOM_PASSWORD_REQUIRED':
            setIsPasswordRequired(true);
            break;

          case 'ROOM_INVALID_PASSWORD':
          case 'INVALID_INPUT':
            setPasswordError(koreanMessage);
            break;

          case 'ROOM_KICKED':
            if (!isMutedRef.current)
              SoundManager.playSfx(
                SOUND_ASSETS.SFX.LOBBY_KICK,
                sfxVolumeRef.current,
              );
            navigate('/', {
              state: { isKicked: true },
              replace: true,
            });
            break;

          case 'ROOM_NOT_FOUND':
          case 'ROOM_FULL':
          case 'GAME_ALREADY_STARTED':
          case 'ACCESS_TOKEN_MISSING':
          case 'EXPIRED_ACCESS_TOKEN':
          case 'INVALID_ACCESS_TOKEN':
          case 'PERMISSION_DENIED':
            alert(koreanMessage);
            navigate('/');
            break;

          default:
            // 알 수 없는 오류나 이미 입장된 상태 등은 홈으로 튕기지 않음
            console.warn('Non-critical socket notification:', response);
            break;
        }
      }
    };

    const handleSyncPlayerList = ({ players }: { players: Player[] }) => {
      const mergedPlayers = mergeOutfitsFromCache(players);
      cacheOutfits(mergedPlayers);
      setRoomState((prev) =>
        prev ? { ...prev, players: mergedPlayers } : null,
      );
      if (!isMutedRef.current)
        SoundManager.playSfx(
          SOUND_ASSETS.SFX.LOBBY_JOINED,
          sfxVolumeRef.current,
        );
    };

    const handleUpdateRoom = ({ roomSettings }: { roomSettings: any }) => {
      setRoomState((prev) =>
        prev ? { ...prev, settings: roomSettings } : null,
      );
      if (!isMutedRef.current)
        SoundManager.playSfx(
          SOUND_ASSETS.SFX.LOBBY_JOINED2,
          sfxVolumeRef.current,
        );
    };

    const handleUpdatePlayer = ({
      userId,
      changes,
    }: {
      userId: string;
      changes: Partial<Player>;
    }) => {
      // outfit 변경이 있으면 캐시 갱신 (bird_01만 있는 outfit은 캐시에 저장하지 않음)
      if (changes.outfit && typeof changes.outfit === 'object') {
        const isDefaultBirdOnly =
          Object.keys(changes.outfit).length === 1 &&
          changes.outfit.bird === 'bird_01';
        if (!isDefaultBirdOnly) {
          outfitCache.set(String(userId), { ...changes.outfit });
        }
      }
      setRoomState((prev) => {
        if (!prev) return null;
        if (!isMutedRef.current)
          SoundManager.playSfx(
            SOUND_ASSETS.SFX.LOBBY_JOINED,
            sfxVolumeRef.current,
          );
        return {
          ...prev,
          players: prev.players.map((p) =>
            String(p.userId) === String(userId) ? { ...p, ...changes } : p,
          ),
        };
      });
    };

    const handleStateSync = (newState: RoomState) => {
      const playersWithOutfits = mergeOutfitsFromCache(newState.players);
      cacheOutfits(playersWithOutfits);
      setRoomState({ ...newState, players: playersWithOutfits });
    };

    const handleConnect = () => {
      joinRoom(initialPassword);
    };

    const handleUpdateGameState = ({
      phase,
      endsAt,
      phaseContext,
    }: UpdateGameStatePayload) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: phase,
          endsAt,
          phaseContext,
        };
      });
    };

    waitingSocket.on('room:joinSuccess', handleJoinSuccess);
    waitingSocket.on('room:syncPlayerList', handleSyncPlayerList);
    waitingSocket.on('room:updateRoom', handleUpdateRoom);
    waitingSocket.on('room:updatePlayer', handleUpdatePlayer);
    waitingSocket.on('room:stateSync', handleStateSync);
    waitingSocket.on('room:updateGameState', handleUpdateGameState);
    waitingSocket.on('connect', handleConnect);
    waitingSocket.on('system:notification', handleSystemNotification);

    if (waitingSocket.connected && isFirstJoinRef.current) {
      joinRoom(initialPassword);
      isFirstJoinRef.current = false;
    }

    return () => {
      waitingSocket.off('room:joinSuccess', handleJoinSuccess);
      waitingSocket.off('room:syncPlayerList', handleSyncPlayerList);
      waitingSocket.off('room:updateRoom', handleUpdateRoom);
      waitingSocket.off('room:updatePlayer', handleUpdatePlayer);
      waitingSocket.off('system:notification', handleSystemNotification);
      waitingSocket.off('room:stateSync', handleStateSync);
      waitingSocket.off('room:updateGameState', handleUpdateGameState);
      waitingSocket.off('connect', handleConnect);
    };
  }, [waitingSocket, roomId, joinRoom, initialPassword, navigate]);

  useEffect(() => {
    // 룸 상태가 있고 소켓이 연결된 상태라면 의상 정보 전송 시도
    if (waitingSocket.connected && roomState?.status === 'WAITING') {
      emitOutfit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.outfit, emitOutfit, waitingSocket.connected, roomState?.status]);

  const me = selectMe(roomState, myUserId ?? '');
  const isSolo = roomState?.settings?.gameMode === 'SOLO';
  const amIHost = String(roomState?.hostId) === String(myUserId);
  const { topTeamId, bottomTeamId, topTeamPlayers, bottomTeamPlayers } =
    selectTopBottomTeams(roomState, myUserId ?? '');
  const canStartGame = selectCanStartGame(roomState);

  const startGame = () => waitingSocket.emit('game:startRequest');
  const toggleReady = () => waitingSocket.emit('room:readyToggle');
  const changeTeam = (targetTeam: 'BLUE' | 'RED' | 'NONE') => {
    if (!me || (me as any).team === targetTeam) return;
    waitingSocket.emit('room:changeTeam', { targetTeam });
  };
  const kickUser = (targetUserId: string | number) =>
    waitingSocket.emit('room:kickUser', { targetUserId: Number(targetUserId) });
  const nudgeUser = (targetUserId: string | number) =>
    waitingSocket.emit('room:nudgeUser', {
      targetUserId: Number(targetUserId),
    });
  const leaveRoom = () => waitingSocket.emit('room:leave');
  const updateStatus = (status: 'IDLE' | 'SHOPPING' | 'CUSTOMIZING') => {
    if (status !== 'IDLE' && me?.isReady && !amIHost) {
      waitingSocket.emit('room:readyToggle');
    }

    waitingSocket.emit('room:updateStatus', { status });
  };

  return {
    roomState,
    me,
    derived: {
      isSolo,
      amIHost,
      canStartGame,
      topTeamPlayers,
      bottomTeamPlayers,
      topTeamId,
      bottomTeamId,
      isPasswordRequired,
      passwordError,
    },
    actions: {
      startGame,
      toggleReady,
      leaveRoom,
      changeTeam,
      nudgeUser,
      kickUser,
      updateStatus,
      joinWithPassword: (password: string) => joinRoom(password),
    },
    constants: {
      myUserId,
    },
  };
};
