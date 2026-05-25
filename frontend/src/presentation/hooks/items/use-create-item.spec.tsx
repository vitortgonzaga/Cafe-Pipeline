import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCreateItem } from "./use-create-item";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";

describe("useCreateItem", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("cria item e invalida cache de listas", async () => {
    const { result } = renderHook(() => useCreateItem(), { wrapper: createQueryWrapper() });

    await result.current.mutateAsync({
      name: "Novo",
      category: "COFFEE",
      quantity: 1,
      minQuantity: 0,
      unit: "UNIT",
      criticality: "LOW",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.create).toHaveBeenCalledOnce();
  });
});
