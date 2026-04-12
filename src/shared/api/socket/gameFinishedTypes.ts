export type GamePhase = 'WAITING' | 'ROUND_SUMMARY' | 'FINISHED' | string;

export interface FinalResult {
  userId: number;
  score: number;
  placement: number;
}

export interface RoomPhaseSnapshotPayload {
  players: Array<{
    userId: number | string;
    isReady: boolean;
  }>;
  readyCount: number;
  totalCount: number;
  allReady: boolean;
}

export interface RoomUpdateGameStatePayload {
  phase: GamePhase;
  endsAt?: string | number | null;
  currentRound?: number;
  totalRounds?: number;
  matchId?: number;
  totalScores?: Record<string, number>;
  roomMemberIdByUserId?: Record<string, number>;
  currentTheme?: string | null;
  recentThemes?: string[];
  phaseContext?: unknown | null;
  finalResults?: FinalResult[];
  finalRewards?: Record<string, unknown>;
  snapshot?: RoomPhaseSnapshotPayload;
}

export interface RewardsGrantedPayload {
  matchId: number;
  exp: number;
  coin: number;
  placement: number;
}
