import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDeleteItem } from "./use-delete-item";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";

describe("useDeleteItem", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("remove item por id", async () => {
    const { result } = renderHook(() => useDeleteItem(), { wrapper: createQueryWrapper() });

    await result.current.mutateAsync("item-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.remove).toHaveBeenCalledWith("item-1");
  });
});
