import type { Category, Criticality, Unit } from "@/domain/items/enums";

export interface CreateItemRequestDTO {
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  unit: Unit;
  criticality: Criticality;
}

export type UpdateItemRequestDTO = CreateItemRequestDTO;
