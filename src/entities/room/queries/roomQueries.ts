import { infiniteQueryOptions, mutationOptions } from '@tanstack/react-query';

import { createRoom } from '../api/createRoom';
import { getRooms } from '../api/getRooms';
import { getRoomState } from '../api/getRoomState';
import type { RoomFilters } from '../model/types';

export const roomQueries = {
  rooms: () => ['rooms'] as const,

  list: (filters: RoomFilters) =>
    infiniteQueryOptions({
      queryKey: [...roomQueries.rooms(), 'list', filters] as const,
      // 26.01.29: API 이슈로 방 현재인원 받아오지 못함
      // 현재 존재하는 모든 방의 상세 정보를 조회하여 인원 수를 가져옴
      // queryFn을 async로 변경하고 로직을 확장
      queryFn: async ({ pageParam }) => {
        // 방 리스트 호출
        const response = await getRooms({ ...filters, cursor: pageParam });

        // 가져온 방들의 id 사용해 각각의 상세 정보 병렬로 호출
        const roomsWithPlayerCount = await Promise.all(
          response.rooms.map(async (room) => {
            try {
              const detail = await getRoomState(room.id);
              return {
                ...room,
                currentPlayers: detail.players.length, // 기존 데이터에 인원 추가
              };
            } catch (error) {
              return { ...room, currentPlayers: 0 };
            }
          }),
        );

        return {
          ...response,
          rooms: roomsWithPlayerCount,
        };
      },

      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    }),

  create: () =>
    mutationOptions({
      mutationKey: [...roomQueries.rooms(), 'create'] as const,
      mutationFn: createRoom,
    }),
};
