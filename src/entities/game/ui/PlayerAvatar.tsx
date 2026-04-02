import { getOutfitImageUrl, OUTFIT_LAYERS } from '@/shared/lib/cdn';
import { getLevelColor } from '@/shared/lib/color';
import type { Outfit } from '@/shared/model';

interface PlayerAvatarProps {
  nickname: string;
  level: number;
  isConnected: boolean;
  outfit?: unknown;
}

const DEFAULT_OUTFIT: Outfit = {
  bird: 'bird_01',
  accessory: null,
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  effect: null,
};

const isDirectImagePath = (value: string) => {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.includes('/outfit_')
  );
};

const toImageSource = (value: string) => {
  if (isDirectImagePath(value)) return value;
  return getOutfitImageUrl(value);
};

const toOutfitValue = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const image =
      source.image ||
      source.outfitImage ||
      source.imageUrl ||
      source.url ||
      source.imagePath;
    if (typeof image === 'string') return image;
  }

  return null;
};

const CATEGORY_MAP: Record<keyof Outfit, string[]> = {
  bird: ['bird', 'body', 'BIRD', 'BODY'],
  accessory: ['accessory', 'acc', 'ACCESSORY', 'ACC'],
  hat: ['hat', 'HAT'],
  top: ['top', 'TOP'],
  bottom: ['bottom', 'BOTTOM'],
  shoes: ['shoes', 'SHOES'],
  effect: ['effect', 'EFFECT'],
};

const applyParsedOutfit = (
  base: Outfit,
  parsed: Record<string, unknown>,
): Outfit => {
  const next = { ...base };

  (Object.keys(CATEGORY_MAP) as (keyof Outfit)[]).forEach((layer) => {
    const keys = CATEGORY_MAP[layer];

    for (const key of keys) {
      if (!(key in parsed)) continue;

      const value = toOutfitValue(parsed[key]);
      if (layer === 'bird') {
        next.bird = value || next.bird;
      } else {
        next[layer] = value;
      }
      break;
    }
  });

  return next;
};

const normalizeOutfit = (outfit?: unknown): Outfit => {
  if (!outfit) return DEFAULT_OUTFIT;

  if (typeof outfit === 'string') {
    if (outfit.includes('{') || outfit.includes('[')) {
      try {
        return normalizeOutfit(JSON.parse(outfit));
      } catch {
        return { ...DEFAULT_OUTFIT, bird: outfit };
      }
    }
    return { ...DEFAULT_OUTFIT, bird: outfit };
  }

  if (Array.isArray(outfit)) {
    const next = { ...DEFAULT_OUTFIT };

    outfit.forEach((item) => {
      if (!item) return;

      if (typeof item === 'string') {
        const lower = item.toLowerCase();
        if (lower.includes('bird') || lower.includes('body')) next.bird = item;
        else if (lower.includes('acc') || lower.includes('accessory')) {
          next.accessory = item;
        } else if (lower.includes('hat')) next.hat = item;
        else if (lower.includes('top') || lower.includes('shirt')) next.top = item;
        else if (lower.includes('bottom') || lower.includes('pants')) {
          next.bottom = item;
        } else if (lower.includes('shoe')) next.shoes = item;
        else if (lower.includes('effect')) next.effect = item;
        return;
      }

      if (typeof item === 'object') {
        const source = item as Record<string, unknown>;
        const category = String(
          source.subCategory || source.category || source.type || source.kind || '',
        ).toUpperCase();
        const image = toOutfitValue(item);
        if (!image) return;

        if (category === 'BIRD' || category === 'BODY') next.bird = image;
        else if (category === 'ACCESSORY' || category === 'ACC') {
          next.accessory = image;
        } else if (category === 'HAT') next.hat = image;
        else if (category === 'TOP') next.top = image;
        else if (category === 'BOTTOM') next.bottom = image;
        else if (category === 'SHOES') next.shoes = image;
        else if (category === 'EFFECT') next.effect = image;
      }
    });

    return next;
  }

  if (typeof outfit !== 'object') return DEFAULT_OUTFIT;
  return applyParsedOutfit(DEFAULT_OUTFIT, outfit as Record<string, unknown>);
};

export const PlayerAvatar = ({
  nickname,
  level,
  isConnected,
  outfit,
}: PlayerAvatarProps) => {
  const normalizedOutfit = normalizeOutfit(outfit);

  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 ${
        !isConnected ? 'grayscale opacity-50' : ''
      }`}
    >
      <div className="relative w-[70px] h-[70px] overflow-hidden rounded-full bg-white mx-auto shadow-inner shadow-black/40">
        {OUTFIT_LAYERS.map((layer, index) => {
          const partId = normalizedOutfit[layer];
          if (!partId || typeof partId !== 'string') return null;

          return (
            <img
              key={layer}
              src={toImageSource(partId)}
              alt={layer}
              className="absolute inset-0 h-full w-full object-contain"
              style={{ zIndex: index + 1 }}
            />
          );
        })}

        <div
          className={`absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 border-[#003D00] ${getLevelColor(level)}`}
        />
      </div>

      <p className="text-center mt-2 text-white font-bold truncate w-20">
        {nickname}
      </p>
    </div>
  );
};
