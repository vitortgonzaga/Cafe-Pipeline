import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const healthController = async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", db: "error" });
  }
};
