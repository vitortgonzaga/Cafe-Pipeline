import "./items-hooks.test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useItems } from "./use-items";
import { createQueryWrapper } from "@/__test-utils__/render";
import {
  itemServiceMock,
  resetItemServiceMock,
  setupDefaultItemServiceMock,
} from "./items-hooks.test-utils";
import { cafeItemFixture } from "@/__test-utils__/fixtures";

describe("useItems", () => {
  beforeEach(() => {
    resetItemServiceMock();
    setupDefaultItemServiceMock();
  });

  it("busca lista de itens via itemService", async () => {
    const { result } = renderHook(() => useItems(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemServiceMock.list).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual([cafeItemFixture]);
  });
});
