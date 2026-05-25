import { describe, it, expect } from "vitest";
import { itemKeys } from "./query-keys";

describe("itemKeys", () => {
  it("monta chaves estáveis para listas, detalhes e movimentações", () => {
    expect(itemKeys.all).toEqual(["items"]);
    expect(itemKeys.list()).toEqual(["items", "list"]);
    expect(itemKeys.detail("abc")).toEqual(["items", "detail", "abc"]);
    expect(itemKeys.movements("abc")).toEqual(["items", "detail", "abc", "movements"]);
  });
});
