import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAllMovements } from "./use-all-movements";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";
import { cafeItemFixture, movementDtoFixture } from "@/__test-utils__/fixtures";
import { toStockMovement } from "@/data/items/mappers/stock-movement.mapper";

describe("useAllMovements", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
    itemServiceMock.listMovements.mockResolvedValue([
      toStockMovement(movementDtoFixture, cafeItemFixture.name),
    ]);
  });

  it("agrega movimentações de todos os itens ordenadas por data", async () => {
    const { result } = renderHook(() => useAllMovements([cafeItemFixture]), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(itemServiceMock.listMovements).toHaveBeenCalledWith("item-1");
    expect(result.current.movements[0]?.itemName).toBe(cafeItemFixture.name);
    expect(result.current.isError).toBe(false);
  });
});
