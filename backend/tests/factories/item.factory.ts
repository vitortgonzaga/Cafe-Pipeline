// ---------------------------------------------------------------------------
// Tipos locais (espelham o schema Prisma sem depender do cliente gerado)
// ---------------------------------------------------------------------------

export interface ItemPayload {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  criticality: string;
}

export interface ItemEntity extends ItemPayload {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// ID padrão reutilizado nos testes
// ---------------------------------------------------------------------------

export const ITEM_ID = "86f1f588-b80e-4f66-a0c1-5b8ace0a9d53";

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

/**
 * Gera um payload de criação/atualização de item.
 * Todos os campos podem ser sobrescritos via `overrides`.
 */
export const makeItemPayload = (overrides: Partial<ItemPayload> = {}): ItemPayload => ({
  name: "Cafe de Deploy",
  category: "DEPLOY",
  quantity: 5,
  minQuantity: 2,
  unit: "UNIT",
  criticality: "MEDIUM",
  ...overrides,
});

/**
 * Gera uma entidade de item completa (como retornada pelo banco).
 * Todos os campos podem ser sobrescritos via `overrides`.
 */
export const makeItem = (overrides: Partial<ItemEntity> = {}): ItemEntity => ({
  id: ITEM_ID,
  ...makeItemPayload(),
  status: "AVAILABLE",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});
