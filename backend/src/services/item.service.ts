import { AppError } from "../errors/app-error";
import {
  createItemSchema,
  itemIdParamSchema,
  updateItemSchema,
  type CreateItemInput,
  type UpdateItemInput,
} from "../types/item.types";
import { ItemRepository } from "../repositories/item.repository";

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  async create(input: CreateItemInput) {
    const payload = createItemSchema.parse(input);
    return this.repository.create(payload);
  }

  async list() {
    return this.repository.findAll();
  }

  async getById(id: string) {
    const { id: itemId } = itemIdParamSchema.parse({ id });
    const item = await this.repository.findById(itemId);

    if (!item) {
      throw new AppError(404, "Item not found", "ITEM_NOT_FOUND");
    }

    return item;
  }

  async update(id: string, input: UpdateItemInput) {
    const { id: itemId } = itemIdParamSchema.parse({ id });
    const payload = updateItemSchema.parse(input);
    const existingItem = await this.repository.findById(itemId);

    if (!existingItem) {
      throw new AppError(404, "Item not found", "ITEM_NOT_FOUND");
    }

    return this.repository.update(itemId, payload);
  }

  async delete(id: string) {
    const { id: itemId } = itemIdParamSchema.parse({ id });
    const existingItem = await this.repository.findById(itemId);

    if (!existingItem) {
      throw new AppError(404, "Item not found", "ITEM_NOT_FOUND");
    }

    await this.repository.delete(itemId);
  }
}
