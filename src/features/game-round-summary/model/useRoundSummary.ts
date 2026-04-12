import { MOCK_ROUND_SUMMARY } from '@/mocks/summary.mock';
import { useAuthStore } from '@/entities/user';
import { useRoomStore } from '@/shared/model/roomStore';
import { useState, useMemo } from 'react';

export const useRoundSummary = () => {
  const user = useAuthStore((state) => state.user);
  const roomState = useRoomStore((state) => state.roomState);
  const [selectedRank, setSelectedRank] = useState(1);

  const liveContext =
    roomState.phaseContext?.kind === 'ROUND_SUMMARY'
      ? roomState.phaseContext
      : null;
  const source = liveContext ?? (import.meta.env.DEV ? MOCK_ROUND_SUMMARY : null);
  const rankings = source?.rankings ?? [];
  const drawingsById = source?.drawingsById ?? {};
  const readyUserIds = source?.readyUserIds ?? [];
  const totalPlayerCount = roomState.players.length || rankings.length;

  const summaryResults = useMemo(
    () =>
      rankings.map((item) => ({
        ...item,
        drawData: drawingsById[item.drawingId] ?? { lines: [] },
        isMine: item.nickname === user?.nickname,
      })),
    [drawingsById, rankings, user?.nickname],
  );

  const currentResult = useMemo(() => {
    return summaryResults[selectedRank - 1] || summaryResults[0];
  }, [selectedRank, summaryResults]);

  const readySummary = useMemo(
    () =>
      source?.readySummary ?? {
        readyCount: readyUserIds.length,
        totalCount: totalPlayerCount,
        allReady: totalPlayerCount > 0 && readyUserIds.length >= totalPlayerCount,
      },
    [readyUserIds.length, source?.readySummary, totalPlayerCount],
  );

  const handleRankSelect = (rank: number) => {
    setSelectedRank(rank);
  };

  return {
    rankings: summaryResults,
    readyUserIds,
    readySummary,
    hasLiveContext: Boolean(liveContext),
    selectedRank,
    currentResult,
    handleRankSelect,
  };
};
