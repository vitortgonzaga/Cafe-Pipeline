import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

const sendError = (
  res: Response,
  req: Request,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void => {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: details ?? null,
    },
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const req = _req;

  if (error instanceof ZodError) {
    sendError(res, req, 400, "VALIDATION_ERROR", "Validation error", error.flatten());
    return;
  }

  if (error instanceof AppError) {
    sendError(res, req, error.statusCode, error.code, error.message, error.details);
    return;
  }

  sendError(res, req, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
};
