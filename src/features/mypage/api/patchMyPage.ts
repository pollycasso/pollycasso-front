import { instance } from '@/shared/api';
import type { ProfileFormValues } from '../model/schema';

type PatchMyPagePayload = Omit<Partial<ProfileFormValues>, 'tag'> & { tag?: number };

export const patchMyPage = async (payload: PatchMyPagePayload) => {
  const { data } = await instance.patch('/users/me', payload);
  return data;
};
