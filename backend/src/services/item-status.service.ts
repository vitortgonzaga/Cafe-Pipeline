export type ItemStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

export const calculateItemStatus = (quantity: number, minQuantity: number): ItemStatus => {
  if (quantity === 0) return "OUT_OF_STOCK";
  if (quantity <= minQuantity) return "LOW_STOCK";
  return "AVAILABLE";
};
