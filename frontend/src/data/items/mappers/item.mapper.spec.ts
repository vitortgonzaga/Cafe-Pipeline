import { describe, it, expect } from "vitest";
import { toCafeItem } from "./item.mapper";
import { cafeItemDtoFixture, cafeItemFixture } from "@/__test-utils__/fixtures";

describe("toCafeItem", () => {
  it("mapeia DTO para entidade de domínio com datas convertidas", () => {
    const result = toCafeItem(cafeItemDtoFixture);

    expect(result).toEqual(cafeItemFixture);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });
});
