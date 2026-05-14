import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum(["COFFEE", "SNACK", "ENERGY_DRINK", "TESTING", "DEPLOY", "ROLLBACK", "HOTFIX"]),
  quantity: z.number().int().min(0),
  minQuantity: z.number().int().min(0),
  unit: z.enum(["UNIT", "KG", "LITER", "PACKAGE"]),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const itemIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateItemSchema = createItemSchema;

export const movementInSchema = z.object({
  quantity: z.number().int().positive(),
  reason: z.string().trim().optional(),
  responsible: z.string().trim().min(1),
});

export const movementOutSchema = z.object({
  quantity: z.number().int().positive(),
  reason: z.string().trim().min(1),
  responsible: z.string().trim().min(1),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type MovementInInput = z.infer<typeof movementInSchema>;
export type MovementOutInput = z.infer<typeof movementOutSchema>;
