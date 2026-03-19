import type { RankingCriteria, PeriodId } from '@/features/ranking/model/types';

export const PERIODS: readonly {
  id: PeriodId;
  label: string;
  color: string;
}[] = [
  { id: 'daily', label: '일간', color: '#C0AA82' },
  { id: 'weekly', label: '주간', color: '#8C6C3B' },
  { id: 'monthly', label: '월간', color: '#59482E' },
] as const;

export const CRITERIA_LABELS: Record<RankingCriteria, string> = {
  coins: '보유코인',
  score: '누적점수',
} as const;
