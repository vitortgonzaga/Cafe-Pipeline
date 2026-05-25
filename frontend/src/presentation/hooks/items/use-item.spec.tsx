import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useItem } from "./use-item";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";
import { cafeItemFixture } from "@/__test-utils__/fixtures";

describe("useItem", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("não dispara query quando id é indefinido", () => {
    const { result } = renderHook(() => useItem(undefined), { wrapper: createQueryWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(itemServiceMock.getById).not.toHaveBeenCalled();
  });

  it("busca item por id quando habilitado", async () => {
    const { result } = renderHook(() => useItem("item-1"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.getById).toHaveBeenCalledWith("item-1");
    expect(result.current.data).toEqual(cafeItemFixture);
  });
});
