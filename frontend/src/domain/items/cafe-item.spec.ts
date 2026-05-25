import { describe, it, expect } from "vitest";
import { computeItemStatus } from "./cafe-item";

describe("computeItemStatus", () => {
  it("retorna OUT_OF_STOCK quando quantidade é zero", () => {
    expect(computeItemStatus(0, 5)).toBe("OUT_OF_STOCK");
  });

  it("retorna LOW_STOCK quando quantidade é menor ou igual ao mínimo", () => {
    expect(computeItemStatus(5, 5)).toBe("LOW_STOCK");
    expect(computeItemStatus(3, 5)).toBe("LOW_STOCK");
  });

  it("retorna AVAILABLE quando quantidade está acima do mínimo", () => {
    expect(computeItemStatus(10, 5)).toBe("AVAILABLE");
  });
});
