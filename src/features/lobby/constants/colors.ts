export const TEAM_COLORS = {
  BLUE: 'from-[#0085FA] to-[#004F94]',
  RED: 'from-[#FF553F] to-[#993326]',
} as const;

export const ACTIVE_STYLE =
  'text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer' as const;

export const DISABLED_STYLE =
  'bg-black text-white/20 cursor-default pointer-events-none' as const;

export const COLOR_MAP = {
  RED: 'bg-[#FF5353] hover:bg-[#FF5353]/70',
  YELLOW: 'bg-[#FFBD2F] hover:bg-[#FFBD2F]/70',
  BLACK: 'bg-black hover:bg-black/70',
} as const;
