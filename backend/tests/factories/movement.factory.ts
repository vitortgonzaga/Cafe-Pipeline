import { ITEM_ID } from "./item.factory";

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

export interface MovementInPayload {
  quantity: number;
  responsible: string;
  reason?: string;
}

export interface MovementOutPayload {
  quantity: number;
  responsible: string;
  reason: string;
}

export interface MovementEntity {
  id: string;
  itemId: string;
  type: string;
  quantity: number;
  reason: string;
  responsible: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

/**
 * Gera um payload de entrada de estoque (IN).
 * `reason` é opcional para movimentos de entrada.
 */
export const makeMovementInPayload = (overrides: Partial<MovementInPayload> = {}): MovementInPayload => ({
  quantity: 3,
  responsible: "vitor",
  reason: "reposicao semanal",
  ...overrides,
});

/**
 * Gera um payload de saída de estoque (OUT).
 * `reason` é obrigatório para movimentos de saída.
 */
export const makeMovementOutPayload = (overrides: Partial<MovementOutPayload> = {}): MovementOutPayload => ({
  quantity: 2,
  responsible: "vitor",
  reason: "consumo em deploy",
  ...overrides,
});

/**
 * Gera uma entidade de movimentação completa (como retornada pelo banco).
 */
export const makeMovement = (overrides: Partial<MovementEntity> = {}): MovementEntity => ({
  id: "m1",
  itemId: ITEM_ID,
  type: "IN",
  quantity: 3,
  reason: "reposicao semanal",
  responsible: "vitor",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});
