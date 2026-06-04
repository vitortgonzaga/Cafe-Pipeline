import request from "supertest";
import { ITEM_ID, makeItem, makeItemPayload } from "./factories/item.factory";
import { makeMovement, makeMovementInPayload, makeMovementOutPayload } from "./factories/movement.factory";

// ---------------------------------------------------------------------------
// Mock do Prisma
// ---------------------------------------------------------------------------

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
  $queryRaw: jest.fn(),
};

jest.mock("../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "../src/app";

// ---------------------------------------------------------------------------
// Setup global
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();

  mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof mockPrisma) => unknown) => {
    return callback(mockPrisma);
  });
});

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------

describe("GET /health", () => {
  it("returns 200 with status ok when database is reachable", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", db: "ok" });
  });
});

// ---------------------------------------------------------------------------
// POST /api/items
// ---------------------------------------------------------------------------

describe("POST /api/items", () => {
  it("creates an item and returns 201 with the created entity", async () => {
    const payload = makeItemPayload({ quantity: 10 });
    const created = makeItem({ quantity: 10, status: "AVAILABLE" });
    mockPrisma.cafeItem.create.mockResolvedValueOnce(created);

    const res = await request(app).post("/api/items").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(ITEM_ID);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/items").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ---------------------------------------------------------------------------
// GET /api/items
// ---------------------------------------------------------------------------

describe("GET /api/items", () => {
  it("returns 200 with the list of items", async () => {
    const items = [makeItem()];
    mockPrisma.cafeItem.findMany.mockResolvedValueOnce(items);

    const res = await request(app).get("/api/items");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("returns 500 on unexpected repository error", async () => {
    mockPrisma.cafeItem.findMany.mockRejectedValueOnce(new Error("boom"));

    const res = await request(app).get("/api/items");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

// ---------------------------------------------------------------------------
// GET /api/items/:id
// ---------------------------------------------------------------------------

describe("GET /api/items/:id", () => {
  it("returns 200 with the item when it exists", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem());

    const res = await request(app).get(`/api/items/${ITEM_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ITEM_ID);
  });

  it("returns 404 when the item does not exist", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get(`/api/items/${ITEM_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ITEM_NOT_FOUND");
  });

  it("returns 400 when the id is not a valid UUID", async () => {
    const res = await request(app).get("/api/items/invalid-id");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.path).toBe("/api/items/invalid-id");
  });
});

// ---------------------------------------------------------------------------
// PUT /api/items/:id
// ---------------------------------------------------------------------------

describe("PUT /api/items/:id", () => {
  it("updates the item and returns 200 with the updated entity", async () => {
    const payload = makeItemPayload({ quantity: 1, criticality: "HIGH" });
    const updated = makeItem({ ...payload, status: "LOW_STOCK" });
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem());
    mockPrisma.cafeItem.update.mockResolvedValueOnce(updated);

    const res = await request(app).put(`/api/items/${ITEM_ID}`).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("LOW_STOCK");
    expect(mockPrisma.cafeItem.update).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/items/:id
// ---------------------------------------------------------------------------

describe("DELETE /api/items/:id", () => {
  it("deletes the item and returns 204 with no body", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem());
    mockPrisma.cafeItem.delete.mockResolvedValueOnce(makeItem());

    const res = await request(app).delete(`/api/items/${ITEM_ID}`);

    expect(res.status).toBe(204);
    expect(mockPrisma.cafeItem.delete).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// POST /api/items/:id/movements/in
// ---------------------------------------------------------------------------

describe("POST /api/items/:id/movements/in", () => {
  it("adds stock and returns 200 with the updated item", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem({ quantity: 5 }));
    mockPrisma.cafeItem.update.mockResolvedValueOnce(makeItem({ quantity: 8, status: "AVAILABLE" }));

    const res = await request(app)
      .post(`/api/items/${ITEM_ID}/movements/in`)
      .send(makeMovementInPayload({ quantity: 3 }));

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(8);
    expect(mockPrisma.stockMovement.create).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// POST /api/items/:id/movements/out
// ---------------------------------------------------------------------------

describe("POST /api/items/:id/movements/out", () => {
  it("consumes stock and returns 200 with the updated item", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem({ quantity: 5, minQuantity: 2 }));
    mockPrisma.cafeItem.update.mockResolvedValueOnce(makeItem({ quantity: 3, status: "AVAILABLE" }));

    const res = await request(app)
      .post(`/api/items/${ITEM_ID}/movements/out`)
      .send(makeMovementOutPayload({ quantity: 2, reason: "consumo no balcao" }));

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(3);
    expect(mockPrisma.cafeItem.update).toHaveBeenCalledWith({
      where: { id: ITEM_ID },
      data: {
        quantity: 3,
        status: "AVAILABLE",
      },
    });
    expect(mockPrisma.stockMovement.create).toHaveBeenCalledWith({
      data: {
        itemId: ITEM_ID,
        type: "OUT",
        quantity: 2,
        reason: "consumo no balcao",
        responsible: "vitor",
      },
    });
  });

  it("returns 400 when reason is empty", async () => {
    const res = await request(app)
      .post(`/api/items/${ITEM_ID}/movements/out`)
      .send(makeMovementOutPayload({ reason: "" }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when quantity exceeds available stock", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem({ quantity: 2 }));

    const res = await request(app)
      .post(`/api/items/${ITEM_ID}/movements/out`)
      .send(makeMovementOutPayload({ quantity: 3 }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });
});

// ---------------------------------------------------------------------------
// GET /api/items/:id/movements
// ---------------------------------------------------------------------------

describe("GET /api/items/:id/movements", () => {
  it("returns 200 with the list of movements", async () => {
    mockPrisma.cafeItem.findUnique.mockResolvedValueOnce(makeItem());
    mockPrisma.stockMovement.findMany.mockResolvedValueOnce([makeMovement()]);

    const res = await request(app).get(`/api/items/${ITEM_ID}/movements`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].type).toBe("IN");
  });
});

// ---------------------------------------------------------------------------
// GET /api/reports/low-stock
// ---------------------------------------------------------------------------

describe("GET /api/reports/low-stock", () => {
  it("returns 200 with items in LOW_STOCK status", async () => {
    mockPrisma.cafeItem.findMany.mockResolvedValueOnce([
      makeItem({ quantity: 1, status: "LOW_STOCK" }),
    ]);

    const res = await request(app).get("/api/reports/low-stock");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("LOW_STOCK");
  });
});

// ---------------------------------------------------------------------------
// GET /api/reports/out-of-stock
// ---------------------------------------------------------------------------

describe("GET /api/reports/out-of-stock", () => {
  it("returns 200 with items in OUT_OF_STOCK status", async () => {
    mockPrisma.cafeItem.findMany.mockResolvedValueOnce([
      makeItem({ quantity: 0, status: "OUT_OF_STOCK" }),
    ]);

    const res = await request(app).get("/api/reports/out-of-stock");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("OUT_OF_STOCK");
  });
});

// ---------------------------------------------------------------------------
// Rotas desconhecidas
// ---------------------------------------------------------------------------

describe("unknown routes", () => {
  it("returns 404 with ROUTE_NOT_FOUND for any unmapped path", async () => {
    const res = await request(app).get("/api/unknown");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
