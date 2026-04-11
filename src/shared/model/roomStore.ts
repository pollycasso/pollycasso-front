import { create } from 'zustand';

import type { PhaseContext, RoomState, RoomStatus } from '@/shared/model';

interface RoomStoreState {
    roomState: RoomState;
    setRoomState: (
        updater: RoomState | ((prev: RoomState) => RoomState)
    ) => void;
    resetRoomState: () => void;
}

const initialRoomState: RoomState = {
    status: 'WAITING' as RoomStatus,
    hostId: '',
    endsAt: null,
    settings: {
        roomTitle: '폴리카소',
        gameMode: 'SOLO',
        maxPlayers: 3,
        isPrivate: false,
    },
    players: [],
    currentRound: null,
    totalRounds: null,
    phaseContext: null as PhaseContext | null,
    teamScore: null,
};

export const useRoomStore = create<RoomStoreState>((set) => ({
    roomState: initialRoomState,

    setRoomState: (updater) =>
        set((state) => ({
            roomState:
                typeof updater === 'function'
                    ? updater(state.roomState)
                    : updater,
        })),

    resetRoomState: () =>
        set({
            roomState: initialRoomState,
        }),
}));
