import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWardrobe } from '../api/getWardrobe';
import { getWardrobeConsumables } from '../api/getWardrobeConsumables';
import { patchWardrobe } from '../api/patchWardrobe';
import type { PatchWardrobeRequest } from '../api/patchWardrobe';

export const wardrobeKeys = {
  all: ['wardrobe'] as const,
  inventory: () => [...wardrobeKeys.all, 'inventory'] as const,
  consumables: () => [...wardrobeKeys.all, 'consumables'] as const,
};

export const useWardrobeInventory = () => {
  return useQuery({
    queryKey: wardrobeKeys.inventory(),
    queryFn: getWardrobe,
  });
};

export const useWardrobeConsumables = () => {
  return useQuery({
    queryKey: wardrobeKeys.consumables(),
    queryFn: getWardrobeConsumables,
  });
};

export const useEquipOutfit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatchWardrobeRequest) => patchWardrobe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.inventory() });
      // TODO: Also invalidate user profile query if needed
    },
  });
};
