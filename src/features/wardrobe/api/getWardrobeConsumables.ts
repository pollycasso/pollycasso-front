import { instance } from '@/shared/api';
import type { Product } from '@/entities/product';

export interface WardrobeConsumableItem extends Omit<Product, 'isOwned'> {
  quantity: number;
}

export interface WardrobeConsumablesResponse {
  inventory: WardrobeConsumableItem[];
}

export const getWardrobeConsumables = async (): Promise<WardrobeConsumablesResponse> => {
  const { data } = await instance.get<WardrobeConsumablesResponse>('/wardrobe/consumables');
  return data;
};
