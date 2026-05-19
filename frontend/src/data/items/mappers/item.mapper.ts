import type { CafeItem } from "@/domain/items/cafe-item";
import type { CafeItemResponseDTO } from "../dto/item-response.dto";

export function toCafeItem(dto: CafeItemResponseDTO): CafeItem {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    quantity: dto.quantity,
    minQuantity: dto.minQuantity,
    unit: dto.unit,
    criticality: dto.criticality,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
