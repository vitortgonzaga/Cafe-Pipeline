import type { Category, Criticality, ItemStatus, Unit } from "./enums";

export interface CafeItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  unit: Unit;
  criticality: Criticality;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function computeItemStatus(quantity: number, minQuantity: number): ItemStatus {
  if (quantity === 0) return "OUT_OF_STOCK";
  if (quantity <= minQuantity) return "LOW_STOCK";
  return "AVAILABLE";
}
