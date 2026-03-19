import { instance } from '@/shared/api';
import type { RoomStatus } from '../model/types';
import type { Outfit, RoomSettings, WaitingStatus } from '@/shared/model';

interface GetRoomsStateResponse {
  status: RoomStatus;
  hostId: number;
  settings: RoomSettings;
  players: WaitingPlayer[];
}

interface WaitingPlayer {
  userId: number;
  nickname: string;
  team: string;
  isReady: boolean;
  level: number;
  status: WaitingStatus;
  outfit: Outfit;
}

export const getRoomState = async (
  roomId: number,
): Promise<GetRoomsStateResponse> => {
  const response = await instance.get<GetRoomsStateResponse>(
    `rooms/${roomId}/waiting`,
  );
  return response.data;
};
