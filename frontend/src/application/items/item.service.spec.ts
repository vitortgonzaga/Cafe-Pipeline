import { describe, it, expect, vi, beforeEach } from "vitest";
import { ItemService } from "./item.service";
import type { IItemRepository } from "@/data/items/item-repository.interface";
import { cafeItemFixture } from "@/__test-utils__/fixtures";

describe("ItemService", () => {
  const repository: IItemRepository = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    addStock: vi.fn(),
    consumeStock: vi.fn(),
    listMovements: vi.fn(),
  };

  const service = new ItemService(repository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delega list para o repositório", async () => {
    vi.mocked(repository.list).mockResolvedValue([cafeItemFixture]);
    await expect(service.list()).resolves.toEqual([cafeItemFixture]);
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it("delega getById para o repositório", async () => {
    vi.mocked(repository.getById).mockResolvedValue(cafeItemFixture);
    await expect(service.getById("item-1")).resolves.toEqual(cafeItemFixture);
    expect(repository.getById).toHaveBeenCalledWith("item-1");
  });

  it("delega create para o repositório", async () => {
    const payload = {
      name: "Novo",
      category: "COFFEE" as const,
      quantity: 1,
      minQuantity: 0,
      unit: "UNIT" as const,
      criticality: "LOW" as const,
    };
    vi.mocked(repository.create).mockResolvedValue(cafeItemFixture);
    await expect(service.create(payload)).resolves.toEqual(cafeItemFixture);
    expect(repository.create).toHaveBeenCalledWith(payload);
  });

  it("delega update para o repositório", async () => {
    const payload = {
      name: "Atualizado",
      category: "COFFEE" as const,
      quantity: 2,
      minQuantity: 1,
      unit: "UNIT" as const,
      criticality: "HIGH" as const,
    };
    vi.mocked(repository.update).mockResolvedValue(cafeItemFixture);
    await expect(service.update("item-1", payload)).resolves.toEqual(cafeItemFixture);
    expect(repository.update).toHaveBeenCalledWith("item-1", payload);
  });

  it("delega remove para o repositório", async () => {
    vi.mocked(repository.remove).mockResolvedValue(undefined);
    await service.remove("item-1");
    expect(repository.remove).toHaveBeenCalledWith("item-1");
  });

  it("delega addStock e consumeStock para o repositório", async () => {
    const inPayload = { quantity: 2, reason: "Reposição", responsible: "Admin" };
    const outPayload = { quantity: 1, reason: "Saída", responsible: "Admin" };
    vi.mocked(repository.addStock).mockResolvedValue(cafeItemFixture);
    vi.mocked(repository.consumeStock).mockResolvedValue(cafeItemFixture);

    await service.addStock("item-1", inPayload);
    await service.consumeStock("item-1", outPayload);

    expect(repository.addStock).toHaveBeenCalledWith("item-1", inPayload);
    expect(repository.consumeStock).toHaveBeenCalledWith("item-1", outPayload);
  });

  it("delega listMovements para o repositório", async () => {
    vi.mocked(repository.listMovements).mockResolvedValue([]);
    await expect(service.listMovements("item-1")).resolves.toEqual([]);
    expect(repository.listMovements).toHaveBeenCalledWith("item-1");
  });
});
