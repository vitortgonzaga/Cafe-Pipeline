import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUpdateItem } from "./use-update-item";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";

describe("useUpdateItem", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("atualiza item com id e payload", async () => {
    const { result } = renderHook(() => useUpdateItem(), { wrapper: createQueryWrapper() });

    await result.current.mutateAsync({
      id: "item-1",
      payload: {
        name: "Atualizado",
        category: "COFFEE",
        quantity: 2,
        minQuantity: 1,
        unit: "UNIT",
        criticality: "HIGH",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.update).toHaveBeenCalledWith("item-1", expect.objectContaining({
      name: "Atualizado",
    }));
  });
});
