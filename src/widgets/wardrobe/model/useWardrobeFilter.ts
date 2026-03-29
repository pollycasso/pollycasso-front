import { useState } from 'react';
import { SHOP_CATEGORIES } from '@/features/shop';
import type { CategoryType } from '@/features/shop';

export const useWardrobeFilter = () => {
  const [activeTab, setActiveTab] = useState<'ITEM' | 'SKILL'>('ITEM');

  const [itemCategory, setItemCategory] = useState<CategoryType>('TOP');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTabChange = (tab: 'ITEM' | 'SKILL') => {
    setActiveTab(tab);
    if (tab === 'SKILL') {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (activeTab === 'SKILL') {
      setActiveTab('ITEM');
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const handleCategorySelect = (category: CategoryType) => {
    setItemCategory(category);
    setActiveTab('ITEM');
    setIsDropdownOpen(false);
  };

  const currentFilterLabel =
    activeTab === 'SKILL' ? '스킬' : SHOP_CATEGORIES[itemCategory];

  const itemButtonLabel =
    activeTab === 'ITEM' ? SHOP_CATEGORIES[itemCategory] : '스킬';

  return {
    activeTab,
    itemCategory,
    isDropdownOpen,
    currentFilterLabel,
    itemButtonLabel,
    handleTabChange,
    toggleDropdown,
    handleCategorySelect,
    setIsDropdownOpen,
  };
};
