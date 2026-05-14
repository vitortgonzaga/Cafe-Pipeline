import { AppError } from "../src/errors/app-error";
import { ItemService } from "../src/services/item.service";

const buildRepositoryMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  applyMovement: jest.fn(),
  listMovements: jest.fn(),
});

describe("ItemService", () => {
  const itemId = "86f1f588-b80e-4f66-a0c1-5b8ace0a9d53";

  it("creates and lists items", async () => {
    const repository = buildRepositoryMock();
    const service = new ItemService(repository as never);

    repository.create.mockResolvedValueOnce({ id: itemId });
    repository.findAll.mockResolvedValueOnce([{ id: itemId }]);

    await expect(
      service.create({
        name: "Cafe",
        category: "COFFEE",
        quantity: 1,
        minQuantity: 0,
        unit: "UNIT",
        criticality: "LOW",
      }),
    ).resolves.toEqual({ id: itemId });

    await expect(service.list()).resolves.toEqual([{ id: itemId }]);
  });

  it("throws ITEM_NOT_FOUND for getById/update/delete/listMovements", async () => {
    const repository = buildRepositoryMock();
    const service = new ItemService(repository as never);
    repository.findById.mockResolvedValue(null);

    await expect(service.getById(itemId)).rejects.toMatchObject({ code: "ITEM_NOT_FOUND" });
    await expect(
      service.update(itemId, {
        name: "Cafe",
        category: "COFFEE",
        quantity: 1,
        minQuantity: 0,
        unit: "UNIT",
        criticality: "LOW",
      }),
    ).rejects.toMatchObject({ code: "ITEM_NOT_FOUND" });
    await expect(service.delete(itemId)).rejects.toMatchObject({ code: "ITEM_NOT_FOUND" });
    await expect(service.listMovements(itemId)).rejects.toMatchObject({ code: "ITEM_NOT_FOUND" });
  });

  it("updates and deletes item when it exists", async () => {
    const repository = buildRepositoryMock();
    const service = new ItemService(repository as never);

    repository.findById.mockResolvedValue({ id: itemId, quantity: 5, minQuantity: 2 });
    repository.update.mockResolvedValue({ id: itemId, status: "LOW_STOCK" });
    repository.delete.mockResolvedValue(undefined);

    await expect(
      service.update(itemId, {
        name: "Cafe",
        category: "COFFEE",
        quantity: 1,
        minQuantity: 2,
        unit: "UNIT",
        criticality: "LOW",
      }),
    ).resolves.toMatchObject({ id: itemId });

    await expect(service.delete(itemId)).resolves.toBeUndefined();
  });

  it("applies IN movement", async () => {
    const repository = buildRepositoryMock();
    const service = new ItemService(repository as never);

    repository.findById.mockResolvedValue({ id: itemId, quantity: 5, minQuantity: 2 });
    repository.applyMovement.mockResolvedValue({ id: itemId, quantity: 8 });

    await expect(service.addStock(itemId, { quantity: 3, responsible: "vitor" })).resolves.toMatchObject({
      quantity: 8,
    });
  });

  it("applies OUT movement and blocks insufficient stock", async () => {
    const repository = buildRepositoryMock();
    const service = new ItemService(repository as never);

    repository.findById.mockResolvedValueOnce({ id: itemId, quantity: 5, minQuantity: 2 });
    repository.applyMovement.mockResolvedValueOnce({ id: itemId, quantity: 3 });

    await expect(
      service.consumeStock(itemId, {
        quantity: 2,
        reason: "consumo",
        responsible: "vitor",
      }),
    ).resolves.toMatchObject({ quantity: 3 });

    repository.findById.mockResolvedValueOnce({ id: itemId, quantity: 1, minQuantity: 0 });

    await expect(
      service.consumeStock(itemId, {
        quantity: 2,
        reason: "consumo",
        responsible: "vitor",
      }),
    ).rejects.toEqual(new AppError(400, "Insufficient stock for movement", "INSUFFICIENT_STOCK"));
  });

  it("lists movements when item exists", async () => {
    const repository = buildRepositoryMock();
    const service = new ItemService(repository as never);

    repository.findById.mockResolvedValue({ id: itemId });
    repository.listMovements.mockResolvedValue([{ id: "m1", itemId }]);

    await expect(service.listMovements(itemId)).resolves.toHaveLength(1);
  });
});
