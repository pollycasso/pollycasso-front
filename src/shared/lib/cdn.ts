import type { Outfit } from '@/shared/model';

export const CDN_BASE_URL = import.meta.env.VITE_ASSET_CDN_URL;

export const OUTFIT_LAYERS: (keyof Outfit)[] = [
  'bird',
  'hat',
  'bottom',
  'top',
  'shoes',
  'accessory',
  'effect',
];

// TODO: assets.ts와 통합
export const getOutfitImageUrl = (id: string) => {
  return `${CDN_BASE_URL}/outfit_${id}.svg?tr=orig&v=2`;
};
