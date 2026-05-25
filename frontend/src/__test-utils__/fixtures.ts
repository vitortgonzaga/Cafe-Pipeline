import type { CafeItem } from "@/domain/items/cafe-item";
import type { CafeItemResponseDTO } from "@/data/items/dto/item-response.dto";
import type { StockMovementResponseDTO } from "@/data/items/dto/movement-response.dto";

export const cafeItemDtoFixture: CafeItemResponseDTO = {
  id: "item-1",
  name: "Café de Deploy",
  category: "COFFEE",
  quantity: 10,
  minQuantity: 5,
  unit: "UNIT",
  criticality: "MEDIUM",
  status: "AVAILABLE",
  createdAt: "2026-05-20T12:00:00.000Z",
  updatedAt: "2026-05-20T12:00:00.000Z",
};

export const cafeItemFixture: CafeItem = {
  id: cafeItemDtoFixture.id,
  name: cafeItemDtoFixture.name,
  category: cafeItemDtoFixture.category,
  quantity: cafeItemDtoFixture.quantity,
  minQuantity: cafeItemDtoFixture.minQuantity,
  unit: cafeItemDtoFixture.unit,
  criticality: cafeItemDtoFixture.criticality,
  status: cafeItemDtoFixture.status,
  createdAt: new Date(cafeItemDtoFixture.createdAt),
  updatedAt: new Date(cafeItemDtoFixture.updatedAt),
};

export const movementDtoFixture: StockMovementResponseDTO = {
  id: "mov-1",
  itemId: "item-1",
  type: "IN",
  quantity: 3,
  reason: "Reposição semanal",
  responsible: "@dev.ops",
  createdAt: "2026-05-20T14:00:00.000Z",
};

export const lowStockItemFixture: CafeItem = {
  ...cafeItemFixture,
  id: "item-2",
  name: "Snack em Low",
  category: "SNACK",
  quantity: 2,
  minQuantity: 5,
  status: "LOW_STOCK",
};

export const outOfStockItemFixture: CafeItem = {
  ...cafeItemFixture,
  id: "item-3",
  name: "Item Zerado",
  quantity: 0,
  status: "OUT_OF_STOCK",
};

export const stockMovementFixture = {
  id: "mov-1",
  itemId: "item-1",
  itemName: cafeItemFixture.name,
  type: "IN" as const,
  quantity: 3,
  reason: "Reposição semanal",
  responsible: "@dev.ops",
  createdAt: new Date("2026-05-20T14:00:00.000Z"),
};

export const stockMovementOutFixture = {
  ...stockMovementFixture,
  id: "mov-2",
  type: "OUT" as const,
  reason: "Deploy em produção",
};
