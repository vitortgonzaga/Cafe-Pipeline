import type { CafeItem } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateItemInput } from "../types/item.types";
import { calculateItemStatus } from "../services/item-status.service";

export class ItemRepository {
  async create(input: CreateItemInput): Promise<CafeItem> {
    return prisma.cafeItem.create({
      data: {
        name: input.name,
        category: input.category,
        quantity: input.quantity,
        minQuantity: input.minQuantity,
        unit: input.unit,
        criticality: input.criticality,
        status: calculateItemStatus(input.quantity, input.minQuantity),
      },
    });
  }

  async findAll(): Promise<CafeItem[]> {
    return prisma.cafeItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
