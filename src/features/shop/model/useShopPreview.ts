import { useState } from 'react';
import type { Product } from '@/entities/product';
import {
  CATEGORY_TO_OUTFIT_KEY,
  SHOP_CATEGORIES,
} from '@/features/shop/constants/shop.constants';
import { useSound } from '@/entities/sound';
import { SoundManager } from '@/shared/api/sound/manager';
import { SOUND_ASSETS } from '@/shared/api/sound/assets';

const ONE_PIECE_IMAGES = ['top_32', 'top_33', 'top_34', 'top_35'];

export const useShopPreview = () => {
  const { sfxVolume, isMuted } = useSound();
  const [previewItems, setPreviewItems] = useState<Product[]>([]);

  const wearItem = (product: Product) => {
    const targetKey = CATEGORY_TO_OUTFIT_KEY[product.subCategory || ''];
    if (!targetKey) return;

    const isSuit = ONE_PIECE_IMAGES.includes(product.image);

    setPreviewItems((prev) => {
      const isAlreadyWearing = prev.some((item) => item.id === product.id);
      if (isAlreadyWearing) {
        if (!isMuted) SoundManager.playSfx(SOUND_ASSETS.SFX.CLICK, sfxVolume);
        return prev.filter((item) => item.id !== product.id);
      }

      if (isSuit) {
        const preservedItems = prev.filter(
          (item) =>
            item.subCategory === SHOP_CATEGORIES.BIRD ||
            item.subCategory === SHOP_CATEGORIES.EFFECT,
        );
        if (!isMuted) SoundManager.playSfx(SOUND_ASSETS.SFX.CLICK, sfxVolume);
        return [...preservedItems, product];
      }

      const currentSuit = prev.find((item) =>
        ONE_PIECE_IMAGES.includes(item.image),
      );

      let baseItems = prev;

      if (currentSuit) {
        baseItems = prev.filter((item) => item.id !== currentSuit.id);
      }

      const filtered = baseItems.filter((item) => {
        const itemKey = CATEGORY_TO_OUTFIT_KEY[item.subCategory || ''];
        return itemKey !== targetKey;
      });

      if (!isMuted) SoundManager.playSfx(SOUND_ASSETS.SFX.CLICK, sfxVolume);
      return [...filtered, product];
    });
  };

  const resetPreview = () => {
    setPreviewItems([]);
    if (!isMuted) SoundManager.playSfx(SOUND_ASSETS.SFX.CLICK, sfxVolume);
  };

  return { previewItems, wearItem, resetPreview };
};
