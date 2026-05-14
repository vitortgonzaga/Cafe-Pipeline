import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: "Validation error", details: error.flatten() });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
};
