import { describe, it, expect } from "vitest";
import { CATEGORIES, categoryLabel } from "./constants";

describe("categoryLabel", () => {
  it("retorna o rótulo amigável para cada categoria", () => {
    expect(categoryLabel("COFFEE")).toBe("☕ Coffee");
    expect(categoryLabel("DEPLOY")).toBe("🚀 Deploy");
  });

  it("expõe todas as categorias do domínio", () => {
    expect(CATEGORIES).toContain("COFFEE");
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });
});
