import type { Request, Response, NextFunction } from "express";
import { ItemController } from "../src/controllers/item.controller";
import { AppError } from "../src/errors/app-error";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ITEM_ID = "86f1f588-b80e-4f66-a0c1-5b8ace0a9d53";

const buildServiceMock = () => ({
  create: jest.fn(),
  list: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addStock: jest.fn(),
  consumeStock: jest.fn(),
  listMovements: jest.fn(),
  listLowStock: jest.fn(),
  listOutOfStock: jest.fn(),
});

const buildRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const buildReq = (overrides: Partial<Request> = {}): Request =>
  ({
    params: { id: ITEM_ID },
    body: {},
    ...overrides,
  }) as unknown as Request;

const stubItem = () => ({
  id: ITEM_ID,
  name: "Cafe de Deploy",
  category: "DEPLOY",
  quantity: 5,
  minQuantity: 2,
  unit: "UNIT",
  criticality: "MEDIUM",
  status: "AVAILABLE",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ItemController", () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------

  describe("create", () => {
    it("returns 201 with the created item on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const item = stubItem();
      service.create.mockResolvedValueOnce(item);

      const req = buildReq({ params: {}, body: item });
      const res = buildRes();

      await controller.create(req, res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(item);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(400, "Validation error", "VALIDATION_ERROR");
      service.create.mockRejectedValueOnce(error);

      await controller.create(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------

  describe("list", () => {
    it("returns 200 with array of items on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const items = [stubItem()];
      service.list.mockResolvedValueOnce(items);

      const res = buildRes();
      await controller.list(buildReq(), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(items);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new Error("db failure");
      service.list.mockRejectedValueOnce(error);

      await controller.list(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // getById
  // -------------------------------------------------------------------------

  describe("getById", () => {
    it("returns 200 with the item on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const item = stubItem();
      service.getById.mockResolvedValueOnce(item);

      const res = buildRes();
      await controller.getById(buildReq(), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(item);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws ITEM_NOT_FOUND", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(404, "Item not found", "ITEM_NOT_FOUND");
      service.getById.mockRejectedValueOnce(error);

      await controller.getById(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("extracts the first element when id param is an array", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const item = stubItem();
      service.getById.mockResolvedValueOnce(item);

      const req = buildReq({ params: { id: [ITEM_ID, "other-id"] as unknown as string } });
      const res = buildRes();

      await controller.getById(req, res, next as unknown as NextFunction);

      expect(service.getById).toHaveBeenCalledWith(ITEM_ID);
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  describe("update", () => {
    it("returns 200 with the updated item on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const updated = { ...stubItem(), quantity: 99, status: "AVAILABLE" };
      service.update.mockResolvedValueOnce(updated);

      const res = buildRes();
      await controller.update(buildReq({ body: { quantity: 99 } }), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(404, "Item not found", "ITEM_NOT_FOUND");
      service.update.mockRejectedValueOnce(error);

      await controller.update(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // delete
  // -------------------------------------------------------------------------

  describe("delete", () => {
    it("returns 204 with no body on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      service.delete.mockResolvedValueOnce(undefined);

      const res = buildRes();
      await controller.delete(buildReq(), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(404, "Item not found", "ITEM_NOT_FOUND");
      service.delete.mockRejectedValueOnce(error);

      await controller.delete(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // addStock
  // -------------------------------------------------------------------------

  describe("addStock", () => {
    it("returns 200 with the updated item on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const updated = { ...stubItem(), quantity: 10 };
      service.addStock.mockResolvedValueOnce(updated);

      const res = buildRes();
      await controller.addStock(
        buildReq({ body: { quantity: 5, responsible: "vitor" } }),
        res,
        next as unknown as NextFunction,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(404, "Item not found", "ITEM_NOT_FOUND");
      service.addStock.mockRejectedValueOnce(error);

      await controller.addStock(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // consumeStock
  // -------------------------------------------------------------------------

  describe("consumeStock", () => {
    it("returns 200 with the updated item on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const updated = { ...stubItem(), quantity: 2 };
      service.consumeStock.mockResolvedValueOnce(updated);

      const res = buildRes();
      await controller.consumeStock(
        buildReq({ body: { quantity: 3, reason: "consumo", responsible: "vitor" } }),
        res,
        next as unknown as NextFunction,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws INSUFFICIENT_STOCK", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(400, "Insufficient stock", "INSUFFICIENT_STOCK");
      service.consumeStock.mockRejectedValueOnce(error);

      await controller.consumeStock(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // listMovements
  // -------------------------------------------------------------------------

  describe("listMovements", () => {
    it("returns 200 with movements array on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const movements = [{ id: "m1", itemId: ITEM_ID, type: "IN", quantity: 3 }];
      service.listMovements.mockResolvedValueOnce(movements);

      const res = buildRes();
      await controller.listMovements(buildReq(), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(movements);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const error = new AppError(404, "Item not found", "ITEM_NOT_FOUND");
      service.listMovements.mockRejectedValueOnce(error);

      await controller.listMovements(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -------------------------------------------------------------------------
  // listLowStock
  // -------------------------------------------------------------------------

  describe("listLowStock", () => {
    it("returns 200 with low-stock items on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const items = [{ ...stubItem(), status: "LOW_STOCK" }];
      service.listLowStock.mockResolvedValueOnce(items);

      const res = buildRes();
      await controller.listLowStock(buildReq(), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(items);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      service.listLowStock.mockRejectedValueOnce(new Error("db error"));

      await controller.listLowStock(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // listOutOfStock
  // -------------------------------------------------------------------------

  describe("listOutOfStock", () => {
    it("returns 200 with out-of-stock items on success", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      const items = [{ ...stubItem(), quantity: 0, status: "OUT_OF_STOCK" }];
      service.listOutOfStock.mockResolvedValueOnce(items);

      const res = buildRes();
      await controller.listOutOfStock(buildReq(), res, next as unknown as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(items);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when service throws", async () => {
      const service = buildServiceMock();
      const controller = new ItemController(service as never);
      service.listOutOfStock.mockRejectedValueOnce(new Error("db error"));

      await controller.listOutOfStock(buildReq(), buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalled();
    });
  });
});
