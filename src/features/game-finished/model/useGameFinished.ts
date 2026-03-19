import { useMemo } from 'react';

import type { FinishedPlayer } from './types';
import type { FinishContext, Player } from '@/shared/model';

export const useGameFinished = (
  players: Player[],
  finishContext: FinishContext | null,
): FinishedPlayer[] => {
  const sortedResults = useMemo(() => {
    if (!finishContext || !finishContext.results) return [];

    const mergedList = finishContext.results.map((result) => {
      const player = players.find((p) => p.userId === result.userId);

      if (!player) return null;

      return {
        ...player,
        ...result,
        isOnPodium: result.rank <= 3,
      };
    });

    return mergedList
      .filter((item): item is FinishedPlayer => item !== null)
      .sort((a, b) => a.rank - b.rank);
  }, [players, finishContext]);

  return sortedResults;
};
