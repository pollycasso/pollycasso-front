import { instance } from '@/shared/api';

export const getConsumables = async () => {
  const { data } = await instance.get('/shop/consumables');
  return data;
};
