import { randomUUID } from "node:crypto";
import type { CreateItemInput } from "../types/item.types";
import { calculateItemStatus } from "../services/item-status.service";

type CafeItem = CreateItemInput & {
  id: string;
  status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  createdAt: Date;
  updatedAt: Date;
};

export class ItemRepository {
  private items: CafeItem[] = [];

  create(input: CreateItemInput): CafeItem {
    const now = new Date();
    const item: CafeItem = {
      id: randomUUID(),
      ...input,
      status: calculateItemStatus(input.quantity, input.minQuantity),
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(item);
    return item;
  }

  findAll(): CafeItem[] {
    return this.items;
  }
}
