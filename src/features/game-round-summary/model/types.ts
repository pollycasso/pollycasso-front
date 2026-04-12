import type { DrawData } from '@/entities/drawing';

export interface RoundSummaryRanking {
  roomMemberId: number;
  nickname: string;
  drawingId: string;
  score: number;
  totalScore: number;
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

export interface RoundSummaryResult {
  roomMemberId: number;
  nickname: string;
  drawingId: string;
  drawData: DrawData;
  score: number;
  totalScore: number;
  isMine: boolean;
}
