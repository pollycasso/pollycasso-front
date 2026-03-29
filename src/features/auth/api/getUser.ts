import { instance } from '@/shared/api';
import type { User } from '@/entities/user';

export const getUser = async (): Promise<User> => {
  const { data } = await instance.get<User>('/users/me');
  return data;
};
