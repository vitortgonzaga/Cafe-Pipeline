import type { Request, Response, NextFunction } from "express";
import { ItemService } from "../services/item.service";

export class ItemController {
  constructor(private readonly service: ItemService) {}

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const item = this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  };

  list = (_req: Request, res: Response): void => {
    res.status(200).json(this.service.list());
  };
}
