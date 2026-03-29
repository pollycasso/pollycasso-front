import { instance } from '@/shared/api';
import type { Product } from '@/entities/product';

export interface WardrobeItem extends Omit<Product, 'isOwned'> {
  isEquipped: boolean;
}

export interface WardrobeInventoryResponse {
  inventory: WardrobeItem[];
}

export const getWardrobe = async (): Promise<WardrobeInventoryResponse> => {
  const { data } = await instance.get<WardrobeInventoryResponse>('/wardrobe');
  return data;
};
