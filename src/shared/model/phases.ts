import type { DrawData } from './drawing';

export const PHASE_TIME = {
  THEME_SELECT: 22,
  DRAWING: 92,
  EVALUATING: 92,
  ROUND_SUMMARY: 32,
  FINISHED: 32,
  DEFAULT: 30,
} as const;

export interface ThemeSelectingContext {
  kind: 'THEME_SELECTING';
  selectorId: number;
  nickname: string;
}

export interface DrawingContext {
  kind: 'DRAWING';
  currentTheme: string;
}

export interface EvaluatingContext {
  kind: 'EVALUATING';
  activeUserIds: string[];
  readyUserIds: string[];
  drawings: Record<string, DrawData>;
  readySummary?: {
    readyCount: number;
    totalCount: number;
    allReady: boolean;
  };
}

export interface RoundSummaryContext {
  kind: 'ROUND_SUMMARY';
  rankings: RoundSummaryRanking[];
  drawingsById: Record<string, DrawData>;
  readyUserIds: number[];
  readySummary?: {
    readyCount: number;
    totalCount: number;
    allReady: boolean;
  };
}

export interface RoundSummaryRanking {
  roomMemberId: number;
  nickname: string;
  drawingId: string;
  score: number;
  totalScore: number;
}

export interface FinishContext {
  kind: 'FINISHED';
  results: {
    userId: string;
    rank: number;
    expGained: number;
    coinsGained: number;
    didLevelUp: boolean;
  }[];
}
