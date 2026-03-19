export const SHOP_CATEGORIES = {
  ITEM: '기술',
  BIRD: '새',
  TOP: '상의',
  BOTTOM: '하의',
  HAT: '모자',
  SHOES: '신발',
  ACCESSORY: '액세서리',
  EFFECT: '효과',
} as const;

export type ShopCategory =
  (typeof SHOP_CATEGORIES)[keyof typeof SHOP_CATEGORIES];

export const LAYER_ORDER: readonly ShopCategory[] = [
  SHOP_CATEGORIES.BIRD,
  SHOP_CATEGORIES.ACCESSORY,
  SHOP_CATEGORIES.HAT,
  SHOP_CATEGORIES.SHOES,
  SHOP_CATEGORIES.BOTTOM,
  SHOP_CATEGORIES.TOP,
  SHOP_CATEGORIES.EFFECT,
] as const;
