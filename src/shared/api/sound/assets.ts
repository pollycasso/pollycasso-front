import {
  Chat,
  Click,
  Countdown,
  EmojiHappy,
  Fireworks,
  ItemAttack,
  ItemAttacked,
  Levelup,
  LobbyJoined,
  LobbyJoined2,
  LobbyKick,
  ModalClosed,
  Purchase,
  PurchaseFailed,
  RoundSummary,
  ShopCart,
  ThemeSelected,
  Timer,
  Timer2x,
} from '@/assets/sounds';

// TODO: 효과음 삽입 후 X 주석 제거할것
export const SOUND_ASSETS = {
  BGM: {
    LOBBY: `${import.meta.env.VITE_ASSET_CDN_URL}/bg_lobby.mp3`,
    GAME: `${import.meta.env.VITE_ASSET_CDN_URL}/bg_game.mp3`,
  },
  SFX: {
    CHAT: Chat,
    CLICK: Click,
    COUNTDOWN: Countdown, // X
    EMOJI_HAPPY: EmojiHappy, // X
    FIREWORKS: Fireworks, // X
    ITEM_ATTACK: ItemAttack, // X
    ITEM_ATTACKED: ItemAttacked, // X
    LEVELUP: Levelup, // X
    LOBBY_JOINED: LobbyJoined,
    LOBBY_JOINED2: LobbyJoined2,
    LOBBY_KICK: LobbyKick,
    MODAL_CLOSED: ModalClosed, // X
    PURCHASE: Purchase,
    PURCHASE_FAILED: PurchaseFailed,
    ROUND_SUMMARY: RoundSummary, // X
    SHOP_CART: ShopCart,
    THEME_SELECTED: ThemeSelected, // X
    TIMER: Timer, // X
    TIMER_2X: Timer2x, // X
  },
};
