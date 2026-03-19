import { instance } from '@/shared/api';

export const getUserInventory = async () => {
  const { data } = await instance.get('/shop/inventory/cosmetics');
  return data;
};
