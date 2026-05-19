import type { MovementType } from "@/domain/items/enums";

export interface StockMovementResponseDTO {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  responsible: string;
  createdAt: string;
}
