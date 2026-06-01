import type { Request, Response } from "express";

// ---------------------------------------------------------------------------
// Mock do Prisma — deve ser declarado antes do import do controller
// ---------------------------------------------------------------------------

const mockPrisma = {
  $queryRaw: jest.fn(),
};

jest.mock("../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { healthController } from "../src/controllers/health.controller";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const fakeReq = {} as Request;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("healthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with status ok when database is reachable", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const res = buildRes();
    await healthController(fakeReq, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "ok", db: "ok" });
  });

  it("returns 503 with status degraded when database is unreachable", async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error("Connection refused"));

    const res = buildRes();
    await healthController(fakeReq, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ status: "degraded", db: "error" });
  });

  it("does not propagate the database error to the caller", async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error("timeout"));

    const res = buildRes();

    await expect(healthController(fakeReq, res)).resolves.toBeUndefined();
  });

  it("calls $queryRaw exactly once per request", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    await healthController(fakeReq, buildRes());

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
