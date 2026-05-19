export const CATEGORY_VALUES = [
  "COFFEE",
  "SNACK",
  "ENERGY_DRINK",
  "TESTING",
  "DEPLOY",
  "ROLLBACK",
  "HOTFIX",
] as const;
export type Category = (typeof CATEGORY_VALUES)[number];

export const UNIT_VALUES = ["UNIT", "KG", "LITER", "PACKAGE"] as const;
export type Unit = (typeof UNIT_VALUES)[number];

export const CRITICALITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export type Criticality = (typeof CRITICALITY_VALUES)[number];

export const ITEM_STATUS_VALUES = ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK"] as const;
export type ItemStatus = (typeof ITEM_STATUS_VALUES)[number];

export const MOVEMENT_TYPE_VALUES = ["IN", "OUT"] as const;
export type MovementType = (typeof MOVEMENT_TYPE_VALUES)[number];
