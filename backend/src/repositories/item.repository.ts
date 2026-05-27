import { Prisma } from "@prisma/client";
import type { CafeItem, ItemStatus, MovementType, StockMovement } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateItemInput, UpdateItemInput } from "../types/item.types";
import { calculateItemStatus } from "../services/item-status.service";

export class ItemRepository {
  private async findByStatus(status: ItemStatus): Promise<CafeItem[]> {
    return prisma.cafeItem.findMany({
      where: { status },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

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

  async findById(id: string): Promise<CafeItem | null> {
    return prisma.cafeItem.findUnique({
      where: { id },
    });
  }

  async update(id: string, input: UpdateItemInput): Promise<CafeItem> {
    return prisma.cafeItem.update({
      where: { id },
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

  async delete(id: string): Promise<void> {
    await prisma.cafeItem.delete({
      where: { id },
    });
  }

  async applyMovement(
    item: CafeItem,
    movement: {
      type: MovementType;
      quantity: number;
      reason: string;
      responsible: string;
    },
  ): Promise<CafeItem> {
    const nextQuantity =
      movement.type === "IN" ? item.quantity + movement.quantity : item.quantity - movement.quantity;

    const nextStatus = calculateItemStatus(nextQuantity, item.minQuantity);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedItem = await tx.cafeItem.update({
        where: { id: item.id },
        data: {
          quantity: nextQuantity,
          status: nextStatus,
        },
      });

      await tx.stockMovement.create({
        data: {
          itemId: item.id,
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason,
          responsible: movement.responsible,
        },
      });

      return updatedItem;
    });
  }

  async listMovements(itemId: string): Promise<StockMovement[]> {
    return prisma.stockMovement.findMany({
      where: { itemId },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findLowStock(): Promise<CafeItem[]> {
    return this.findByStatus("LOW_STOCK");
  }

  async findOutOfStock(): Promise<CafeItem[]> {
    return this.findByStatus("OUT_OF_STOCK");
  }
}
