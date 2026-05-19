import type { Category, Criticality, ItemStatus, Unit } from "@/domain/items/enums";

export interface CafeItemResponseDTO {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  unit: Unit;
  criticality: Criticality;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}
