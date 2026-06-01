import type { Request, Response, NextFunction } from "express";
import { ItemService } from "../services/item.service";

export class ItemController {
  constructor(private readonly service: ItemService) {}

  private getIdParam(req: Request): string {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.list();
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.getById(this.getIdParam(req));
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.update(this.getIdParam(req), req.body);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(this.getIdParam(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  addStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.addStock(this.getIdParam(req), req.body);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  consumeStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.consumeStock(this.getIdParam(req), req.body);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  listMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movements = await this.service.listMovements(this.getIdParam(req));
      res.status(200).json(movements);
    } catch (error) {
      next(error);
    }
  };

  listLowStock = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.listLowStock();
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  };

  listOutOfStock = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.listOutOfStock();
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  };
}
