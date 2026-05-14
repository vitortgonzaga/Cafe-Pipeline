import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum(["COFFEE", "SNACK", "ENERGY_DRINK", "TESTING", "DEPLOY", "ROLLBACK", "HOTFIX"]),
  quantity: z.number().int().min(0),
  minQuantity: z.number().int().min(0),
  unit: z.enum(["UNIT", "KG", "LITER", "PACKAGE"]),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
