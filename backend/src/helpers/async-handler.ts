import type { Request, Response, NextFunction } from "express";

/**
 * Encapsula handlers assíncronos do Express, capturando qualquer erro lançado
 * e repassando-o para o middleware de erro via `next(error)`.
 *
 * Elimina o boilerplate de try/catch repetido em cada handler do controller.
 *
 * @example
 * create = asyncHandler(async (req, res) => {
 *   const item = await this.service.create(req.body);
 *   res.status(201).json(item);
 * });
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
