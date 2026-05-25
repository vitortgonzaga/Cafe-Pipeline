import { describe, it, expect } from "vitest";
import { toStockMovement } from "./stock-movement.mapper";
import { movementDtoFixture } from "@/__test-utils__/fixtures";

describe("toStockMovement", () => {
  it("mapeia DTO para movimentação com data e nome opcional do item", () => {
    const result = toStockMovement(movementDtoFixture, "Café de Deploy");

    expect(result).toMatchObject({
      id: movementDtoFixture.id,
      itemId: movementDtoFixture.itemId,
      itemName: "Café de Deploy",
      type: "IN",
      quantity: 3,
      reason: movementDtoFixture.reason,
      responsible: movementDtoFixture.responsible,
    });
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("permite omitir itemName", () => {
    const result = toStockMovement(movementDtoFixture);
    expect(result.itemName).toBeUndefined();
  });
});
