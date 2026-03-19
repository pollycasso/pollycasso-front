import { getOutfitItemUrl } from '@/shared/lib/assets';
import { LAYER_ORDER, SHOP_CATEGORIES } from '@/shared/constants/outfit';
import type { ShopCategory } from '@/shared/constants/outfit';

interface MiniAvatarProps {
  outfit: Record<string, string>;
}

export const MiniAvatar = ({ outfit }: MiniAvatarProps) => {
  const sortedLayers = Object.entries(outfit).sort(
    (a, b) =>
      LAYER_ORDER.indexOf(a[0] as ShopCategory) -
      LAYER_ORDER.indexOf(b[0] as ShopCategory),
  );

  return (
    <div className="relative w-[60px] h-[60px] rounded-full bg-white overflow-hidden">
      {sortedLayers.map(([category, imageId]) => (
        <img
          key={category}
          src={getOutfitItemUrl(imageId)}
          className="absolute top-3 scale-110 h-auto"
          style={{ zIndex: category === SHOP_CATEGORIES.BIRD ? 10 : 20 }}
          alt={category}
        />
      ))}
    </div>
  );
};
