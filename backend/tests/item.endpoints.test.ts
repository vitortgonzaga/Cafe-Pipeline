import request from "supertest";

const mockPrisma = {
  cafeItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  stockMovement: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "../src/app";

describe("Item endpoints", () => {
  const itemId = "86f1f588-b80e-4f66-a0c1-5b8ace0a9d53";

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof mockPrisma) => unknown) => {
      return callback(mockPrisma);
    });
  });

  it("returns 400 with clear payload for invalid item id", async () => {
    const response = await request(app).get("/api/items/invalid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.message).toBe("Validation error");
    expect(response.body.path).toBe("/api/items/invalid-id");
  });

  it("returns 404 when item does not exist", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(null);

    const response = await request(app).get(`/api/items/${itemId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("ITEM_NOT_FOUND");
    expect(response.body.error.message).toBe("Item not found");
  });

  it("returns 200 when item exists", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce({
      id: itemId,
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

    const response = await request(app).get(`/api/items/${itemId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(itemId);
  });

  it("updates an item and returns 200", async () => {
    const payload = {
      name: "Cafe de Deploy",
      category: "DEPLOY",
      quantity: 1,
      minQuantity: 2,
      unit: "UNIT",
      criticality: "HIGH",
    };

    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce({ id: itemId });
    mockPrisma.cafeItem.update.mockResolvedValueOnce({
      id: itemId,
      ...payload,
      status: "LOW_STOCK",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).put(`/api/items/${itemId}`).send(payload);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("LOW_STOCK");
    expect(mockPrisma.cafeItem.update).toHaveBeenCalledTimes(1);
  });

  it("deletes an item and returns 204", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce({ id: itemId });
    mockPrisma.cafeItem.delete.mockResolvedValueOnce({ id: itemId });

    const response = await request(app).delete(`/api/items/${itemId}`);

    expect(response.status).toBe(204);
    expect(mockPrisma.cafeItem.delete).toHaveBeenCalledTimes(1);
  });

  it("adds stock movement IN and returns updated item", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce({
      id: itemId,
      quantity: 5,
      minQuantity: 2,
    });

    mockPrisma.cafeItem.update.mockResolvedValueOnce({
      id: itemId,
      quantity: 8,
      minQuantity: 2,
      status: "AVAILABLE",
    });

    const response = await request(app).post(`/api/items/${itemId}/movements/in`).send({
      quantity: 3,
      responsible: "vitor",
      reason: "reposicao",
    });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(8);
    expect(mockPrisma.stockMovement.create).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when OUT movement has no reason", async () => {
    const response = await request(app).post(`/api/items/${itemId}/movements/out`).send({
      quantity: 2,
      responsible: "vitor",
      reason: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when OUT movement exceeds stock", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce({
      id: itemId,
      quantity: 2,
      minQuantity: 1,
    });

    const response = await request(app).post(`/api/items/${itemId}/movements/out`).send({
      quantity: 3,
      responsible: "vitor",
      reason: "deploy em producao",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("lists item movements", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce({ id: itemId });
    mockPrisma.stockMovement.findMany.mockResolvedValueOnce([
      {
        id: "m1",
        itemId,
        type: "IN",
        quantity: 3,
        reason: "reposicao",
        responsible: "vitor",
        createdAt: new Date(),
      },
    ]);

    const response = await request(app).get(`/api/items/${itemId}/movements`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toBe("IN");
  });

  it("returns 404 for unknown route", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("returns health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("creates and lists items", async () => {
    const now = new Date();
    const payload = {
      name: "Cafe de Deploy",
      category: "DEPLOY",
      quantity: 10,
      minQuantity: 2,
      unit: "UNIT",
      criticality: "MEDIUM",
    };

    mockPrisma.cafeItem.create.mockResolvedValueOnce({
      id: itemId,
      ...payload,
      status: "AVAILABLE",
      createdAt: now,
      updatedAt: now,
    });

    const createResponse = await request(app).post("/api/items").send(payload);
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBe(itemId);

    mockPrisma.cafeItem.findMany.mockResolvedValueOnce([createResponse.body]);
    const listResponse = await request(app).get("/api/items");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
  });

  it("returns 500 on unexpected repository error", async () => {
    mockPrisma.cafeItem.findMany.mockRejectedValueOnce(new Error("boom"));
    const response = await request(app).get("/api/items");
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
