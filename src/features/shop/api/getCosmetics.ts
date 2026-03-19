import { instance } from '@/shared/api';

export const getCosmetics = async () => {
  const { data } = await instance.get('/shop/cosmetics');
  return data;
};
