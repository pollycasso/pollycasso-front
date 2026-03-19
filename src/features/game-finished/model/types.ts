import type { Player } from '@/shared/model';

export interface FinishedPlayer extends Player {
  rank: number;
  expGained: number;
  coinsGained: number;
  didLevelUp: boolean;

  isOnPodium: boolean;
}
