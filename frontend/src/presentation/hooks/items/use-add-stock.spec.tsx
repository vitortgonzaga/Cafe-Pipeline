import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAddStock } from "./use-add-stock";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";

describe("useAddStock", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("registra entrada de estoque", async () => {
    const { result } = renderHook(() => useAddStock(), { wrapper: createQueryWrapper() });

    await result.current.mutateAsync({
      id: "item-1",
      payload: { quantity: 2, reason: "Reposição", responsible: "Admin" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.addStock).toHaveBeenCalledWith("item-1", {
      quantity: 2,
      reason: "Reposição",
      responsible: "Admin",
    });
  });
});
