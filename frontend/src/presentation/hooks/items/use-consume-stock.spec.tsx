import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useConsumeStock } from "./use-consume-stock";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";

describe("useConsumeStock", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("registra saída de estoque", async () => {
    const { result } = renderHook(() => useConsumeStock(), { wrapper: createQueryWrapper() });

    await result.current.mutateAsync({
      id: "item-1",
      payload: { quantity: 1, reason: "Deploy", responsible: "Admin" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.consumeStock).toHaveBeenCalledWith("item-1", {
      quantity: 1,
      reason: "Deploy",
      responsible: "Admin",
    });
  });
});
