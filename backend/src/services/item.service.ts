import { createItemSchema, type CreateItemInput } from "../types/item.types";
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
}
