import type { Request, Response, NextFunction } from "express";
import { ItemService } from "../services/item.service";

export class ItemController {
  constructor(private readonly service: ItemService) {}

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
}
