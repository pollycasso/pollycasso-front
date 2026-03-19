export const maskId = (id: string) => {
  if (!id) return '';
  if (id.length <= 4) return id;
  return id.slice(0, 4) + '*'.repeat(4);
};
