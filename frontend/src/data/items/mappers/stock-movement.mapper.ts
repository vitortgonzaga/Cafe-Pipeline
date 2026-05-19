import type { StockMovement } from "@/domain/items/stock-movement";
import type { StockMovementResponseDTO } from "../dto/movement-response.dto";

export function toStockMovement(dto: StockMovementResponseDTO, itemName?: string): StockMovement {
  return {
    id: dto.id,
    itemId: dto.itemId,
    itemName,
    type: dto.type,
    quantity: dto.quantity,
    reason: dto.reason,
    responsible: dto.responsible,
    createdAt: new Date(dto.createdAt),
  };
}
