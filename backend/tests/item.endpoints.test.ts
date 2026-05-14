import request from "supertest";

const mockPrisma = {
  cafeItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "../src/app";

describe("Item endpoints", () => {
  const itemId = "86f1f588-b80e-4f66-a0c1-5b8ace0a9d53";

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("returns 404 for unknown route", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
