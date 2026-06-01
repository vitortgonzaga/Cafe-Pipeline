import type { Request, Response, NextFunction } from "express";
import { ItemService } from "../services/item.service";
import { asyncHandler } from "../helpers/async-handler";

export class ItemController {
  constructor(private readonly service: ItemService) {}

  private getIdParam(req: Request): string {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.service.create(req.body);
    res.status(201).json(item);
  });

  list = asyncHandler(async (_req: Request, res: Response) => {
    const items = await this.service.list();
    res.status(200).json(items);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.service.getById(this.getIdParam(req));
    res.status(200).json(item);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.service.update(this.getIdParam(req), req.body);
    res.status(200).json(item);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(this.getIdParam(req));
    res.status(204).send();
  });

  addStock = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.service.addStock(this.getIdParam(req), req.body);
    res.status(200).json(item);
  });

  consumeStock = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.service.consumeStock(this.getIdParam(req), req.body);
    res.status(200).json(item);
  });

  listMovements = asyncHandler(async (req: Request, res: Response) => {
    const movements = await this.service.listMovements(this.getIdParam(req));
    res.status(200).json(movements);
  });

  listLowStock = asyncHandler(async (_req: Request, res: Response) => {
    const items = await this.service.listLowStock();
    res.status(200).json(items);
  });

  listOutOfStock = asyncHandler(async (_req: Request, res: Response) => {
    const items = await this.service.listOutOfStock();
    res.status(200).json(items);
  });
}
