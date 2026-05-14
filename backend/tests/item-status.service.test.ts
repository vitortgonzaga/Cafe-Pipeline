import { calculateItemStatus } from "../src/services/item-status.service";

describe("calculateItemStatus", () => {
  it("returns OUT_OF_STOCK when quantity is 0", () => {
    expect(calculateItemStatus(0, 5)).toBe("OUT_OF_STOCK");
  });

  it("returns LOW_STOCK when quantity is lower than or equal to min", () => {
    expect(calculateItemStatus(3, 5)).toBe("LOW_STOCK");
    expect(calculateItemStatus(5, 5)).toBe("LOW_STOCK");
  });

  it("returns AVAILABLE when quantity is greater than min", () => {
    expect(calculateItemStatus(6, 5)).toBe("AVAILABLE");
  });
});
