import { vi } from "vitest";
import { cafeItemFixture } from "@/__test-utils__/fixtures";

export const itemServiceMock = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  addStock: vi.fn(),
  consumeStock: vi.fn(),
  listMovements: vi.fn(),
};

vi.mock("@/application/items", () => ({
  itemService: itemServiceMock,
}));

export function resetItemServiceMock() {
  itemServiceMock.list.mockReset();
  itemServiceMock.getById.mockReset();
  itemServiceMock.create.mockReset();
  itemServiceMock.update.mockReset();
  itemServiceMock.remove.mockReset();
  itemServiceMock.addStock.mockReset();
  itemServiceMock.consumeStock.mockReset();
  itemServiceMock.listMovements.mockReset();
}

export function setupDefaultItemServiceMock() {
  itemServiceMock.list.mockResolvedValue([cafeItemFixture]);
  itemServiceMock.getById.mockResolvedValue(cafeItemFixture);
  itemServiceMock.create.mockResolvedValue(cafeItemFixture);
  itemServiceMock.update.mockResolvedValue(cafeItemFixture);
  itemServiceMock.remove.mockResolvedValue(undefined);
  itemServiceMock.addStock.mockResolvedValue(cafeItemFixture);
  itemServiceMock.consumeStock.mockResolvedValue(cafeItemFixture);
  itemServiceMock.listMovements.mockResolvedValue([]);
}
