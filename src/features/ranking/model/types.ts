export type RankingCriteria = 'coins' | 'score';

export type PeriodId = 'daily' | 'weekly' | 'monthly';

export interface RankingUser {
  rank: number;
  username: string;
  nickname: string;
  level: number;
  value: number;
  outfit: Record<string, string>;
}
