import type { RoundSummaryContext } from '@/features/game-round-summary';

export const MOCK_ROUND_SUMMARY: RoundSummaryContext = {
  kind: 'ROUND_SUMMARY',
  rankings: [
    {
      roomMemberId: 101,
      nickname: 'playerA',
      drawingId: '12:101:1',
      score: 9.2,
      totalScore: 18,
    },
    {
      roomMemberId: 102,
      nickname: 'playerB',
      drawingId: '12:102:1',
      score: 8.5,
      totalScore: 14,
    },
    {
      roomMemberId: 103,
      nickname: 'playerC',
      drawingId: '12:103:1',
      score: 7.8,
      totalScore: 11,
    },
  ],
  drawingsById: {
    '12:101:1': {
      lines: [
        {
          tool: 'brush',
          color: '#FF0000',
          size: 5,
          points: [10, 10, 20, 20, 30, 30],
        },
      ],
    },
    '12:102:1': {
      lines: [
        {
          tool: 'pencil',
          color: '#00AAFF',
          size: 3,
          points: [40, 40, 50, 55, 60, 60],
        },
      ],
    },
    '12:103:1': {
      lines: [
        {
          tool: 'neon',
          color: '#00FF88',
          size: 6,
          points: [80, 90, 95, 110, 110, 130],
        },
      ],
    },
  },
  readyUserIds: [101],
};
