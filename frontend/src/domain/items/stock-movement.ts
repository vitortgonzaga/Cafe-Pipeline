import type { MovementType } from "./enums";

export interface StockMovement {
  id: string;
  itemId: string;
  itemName?: string;
  type: MovementType;
  quantity: number;
  reason: string;
  responsible: string;
  createdAt: Date;
}
