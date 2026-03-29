import { instance } from '@/shared/api';
import type { Outfit } from '@/shared/model';

export interface PatchWardrobeRequest {
  outfitIds: Record<keyof Outfit, number | null>;
}

export interface PatchWardrobeResponse {
  data: {
    outfit: Record<keyof Outfit, number | null>;
  };
}

export const patchWardrobe = async (
  payload: PatchWardrobeRequest,
): Promise<PatchWardrobeResponse> => {
  const { data } = await instance.patch<PatchWardrobeResponse>(
    '/wardrobe',
    payload,
  );
  return data;
};
