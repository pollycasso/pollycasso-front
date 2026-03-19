import type {
  FinishContext,
  Outfit,
  Player,
  RoomSettings,
  RoomState,
} from '@/shared/model';

const createOutfit = (overrides?: Partial<Outfit>): Outfit => ({
  bird: 'bird',
  accessory: null,
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  effect: null,
  ...overrides,
});

export const MOCK_PLAYERS: Player[] = [
  {
    userId: 'user_1',
    nickname: '폴리카소07',
    level: 12,
    exp: 80,
    coins: 1500,
    status: 'IDLE',
    teamId: null,
    isConnected: true,
    isReady: true,
    totalScore: 290,
    inventory: [],
    outfit: createOutfit({
      bird: 'king_penguin',
      hat: 'laurel_wreath',
      effect: 'spotlight',
    }),
  },
  {
    userId: 'user_2',
    nickname: 'DFPOW',
    level: 8,
    exp: 45,
    coins: 800,
    status: 'IDLE',
    teamId: null,
    isConnected: true,
    isReady: true,
    totalScore: 280,
    inventory: [],
    outfit: createOutfit({ bird: 'sparrow', accessory: 'silver_medal' }),
  },
  {
    userId: 'user_3',
    nickname: 'EGG22', // 3등
    level: 5,
    exp: 20,
    coins: 300,
    status: 'IDLE',
    teamId: null,
    isConnected: true,
    isReady: true,
    totalScore: 270,
    inventory: [],
    outfit: createOutfit({ bird: 'chick', accessory: 'bronze_medal' }),
  },
  {
    userId: 'user_4',
    nickname: 'DFJAS', // 4등
    level: 10,
    exp: 100,
    coins: 1200,
    status: 'IDLE',
    teamId: null,
    isConnected: true,
    isReady: true,
    totalScore: 260,
    inventory: [],
    outfit: createOutfit({ bird: 'duck_white' }),
  },
  {
    userId: 'user_5',
    nickname: '모던애자일', // 5등
    level: 20,
    exp: 200,
    coins: 5000,
    status: 'IDLE',
    teamId: null,
    isConnected: true,
    isReady: true,
    totalScore: 250,
    inventory: [],
    outfit: createOutfit({ bird: 'owl_grey', hat: 'glasses' }),
  },
  {
    userId: 'user_6',
    nickname: 'EGG1',
    level: 2,
    exp: 10,
    coins: 50,
    status: 'IDLE',
    teamId: null,
    isConnected: true,
    isReady: true,
    totalScore: 240,
    inventory: [],
    outfit: createOutfit({ bird: 'parrot_basic' }),
  },
];

export const MOCK_FINISH_CONTEXT: FinishContext = {
  results: [
    {
      userId: 'user_1',
      rank: 1,
      expGained: 30,
      coinsGained: 20,
      didLevelUp: true,
    },
    {
      userId: 'user_2',
      rank: 2,
      expGained: 30,
      coinsGained: 20,
      didLevelUp: false,
    },
    {
      userId: 'user_3',
      rank: 3,
      expGained: 30,
      coinsGained: 20,
      didLevelUp: false,
    },
    {
      userId: 'user_4',
      rank: 4,
      expGained: 30,
      coinsGained: 20,
      didLevelUp: false,
    },
    {
      userId: 'user_5',
      rank: 5,
      expGained: 30,
      coinsGained: 20,
      didLevelUp: false,
    },
    {
      userId: 'user_6',
      rank: 6,
      expGained: 30,
      coinsGained: 20,
      didLevelUp: false,
    },
  ],
};

const MOCK_ROOM_SETTINGS: RoomSettings = {
  roomTitle: '폴리카소 참 잘하는 집',
  maxPlayers: 6,
  gameMode: 'SOLO',
  isPrivate: false,
};

const MOCK_TEAM_PLAYERS = MOCK_PLAYERS.map((p, i) => ({
  ...p,
  teamId: i % 2 === 0 ? 'RED' : 'BLUE',
}));

export const MOCK_FINISHED_ROOM_STATE: RoomState = {
  status: 'FINISHED',
  hostId: MOCK_PLAYERS[0].userId,
  endsAt: Date.now() + 1000 * 10,

  settings: MOCK_ROOM_SETTINGS,
  players: MOCK_PLAYERS,
  currentRound: 3,
  totalRounds: 3,

  phaseContext: MOCK_FINISH_CONTEXT,

  teamScore: null,
};

export const MOCK_TEAM_FINISHED_ROOM_STATE: RoomState = {
  ...MOCK_FINISHED_ROOM_STATE,

  settings: {
    ...MOCK_ROOM_SETTINGS,
    gameMode: 'TEAM',
  },

  players: MOCK_TEAM_PLAYERS,

  teamScore: {
    blue: 120,
    red: 150,
  },
};
