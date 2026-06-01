import {
  createItemSchema,
  itemIdParamSchema,
  movementInSchema,
  movementOutSchema,
  updateItemSchema,
} from "../src/types/item.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validItem = {
  name: "Cafe de Deploy",
  category: "DEPLOY" as const,
  quantity: 10,
  minQuantity: 2,
  unit: "UNIT" as const,
  criticality: "MEDIUM" as const,
};

const validUuid = "86f1f588-b80e-4f66-a0c1-5b8ace0a9d53";

// ---------------------------------------------------------------------------
// createItemSchema
// ---------------------------------------------------------------------------

describe("createItemSchema", () => {
  it("accepts a fully valid item payload", () => {
    expect(() => createItemSchema.parse(validItem)).not.toThrow();
  });

  describe("name", () => {
    it("rejects empty string", () => {
      expect(() => createItemSchema.parse({ ...validItem, name: "" })).toThrow();
    });

    it("rejects whitespace-only string", () => {
      expect(() => createItemSchema.parse({ ...validItem, name: "   " })).toThrow();
    });

    it("trims and accepts a name with surrounding spaces", () => {
      const result = createItemSchema.parse({ ...validItem, name: "  Cafe  " });
      expect(result.name).toBe("Cafe");
    });
  });

  describe("category", () => {
    it.each(["COFFEE", "SNACK", "ENERGY_DRINK", "TESTING", "DEPLOY", "ROLLBACK", "HOTFIX"])(
      "accepts valid category %s",
      (category) => {
        expect(() => createItemSchema.parse({ ...validItem, category })).not.toThrow();
      },
    );

    it("rejects an invalid category", () => {
      expect(() => createItemSchema.parse({ ...validItem, category: "PIZZA" })).toThrow();
    });

    it("rejects empty string as category", () => {
      expect(() => createItemSchema.parse({ ...validItem, category: "" })).toThrow();
    });
  });

  describe("quantity", () => {
    it("accepts zero", () => {
      expect(() => createItemSchema.parse({ ...validItem, quantity: 0 })).not.toThrow();
    });

    it("rejects negative number", () => {
      expect(() => createItemSchema.parse({ ...validItem, quantity: -1 })).toThrow();
    });

    it("rejects decimal number", () => {
      expect(() => createItemSchema.parse({ ...validItem, quantity: 1.5 })).toThrow();
    });
  });

  describe("minQuantity", () => {
    it("accepts zero", () => {
      expect(() => createItemSchema.parse({ ...validItem, minQuantity: 0 })).not.toThrow();
    });

    it("rejects negative number", () => {
      expect(() => createItemSchema.parse({ ...validItem, minQuantity: -5 })).toThrow();
    });

    it("rejects decimal number", () => {
      expect(() => createItemSchema.parse({ ...validItem, minQuantity: 0.5 })).toThrow();
    });
  });

  describe("unit", () => {
    it.each(["UNIT", "KG", "LITER", "PACKAGE"])("accepts valid unit %s", (unit) => {
      expect(() => createItemSchema.parse({ ...validItem, unit })).not.toThrow();
    });

    it("rejects an invalid unit", () => {
      expect(() => createItemSchema.parse({ ...validItem, unit: "METER" })).toThrow();
    });
  });

  describe("criticality", () => {
    it.each(["LOW", "MEDIUM", "HIGH"])("accepts valid criticality %s", (criticality) => {
      expect(() => createItemSchema.parse({ ...validItem, criticality })).not.toThrow();
    });

    it("rejects an invalid criticality", () => {
      expect(() => createItemSchema.parse({ ...validItem, criticality: "CRITICAL" })).toThrow();
    });
  });

  it("rejects payload missing required fields", () => {
    expect(() => createItemSchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// updateItemSchema (alias de createItemSchema)
// ---------------------------------------------------------------------------

describe("updateItemSchema", () => {
  it("accepts the same valid payload as createItemSchema", () => {
    expect(() => updateItemSchema.parse(validItem)).not.toThrow();
  });

  it("rejects payload with invalid enum", () => {
    expect(() => updateItemSchema.parse({ ...validItem, criticality: "EXTREME" })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// itemIdParamSchema
// ---------------------------------------------------------------------------

describe("itemIdParamSchema", () => {
  it("accepts a valid UUID v4", () => {
    expect(() => itemIdParamSchema.parse({ id: validUuid })).not.toThrow();
  });

  it("rejects a plain string that is not a UUID", () => {
    expect(() => itemIdParamSchema.parse({ id: "invalid-id" })).toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => itemIdParamSchema.parse({ id: "" })).toThrow();
  });

  it("rejects a UUID with wrong format (missing segment)", () => {
    expect(() => itemIdParamSchema.parse({ id: "86f1f588-b80e-4f66-a0c1" })).toThrow();
  });

  it("returns the id when valid", () => {
    const result = itemIdParamSchema.parse({ id: validUuid });
    expect(result.id).toBe(validUuid);
  });
});

// ---------------------------------------------------------------------------
// movementInSchema
// ---------------------------------------------------------------------------

describe("movementInSchema", () => {
  const validIn = { quantity: 5, responsible: "vitor" };

  it("accepts a valid IN movement", () => {
    expect(() => movementInSchema.parse(validIn)).not.toThrow();
  });

  it("accepts an IN movement with optional reason", () => {
    expect(() => movementInSchema.parse({ ...validIn, reason: "reposicao" })).not.toThrow();
  });

  it("accepts an IN movement without reason (optional)", () => {
    expect(() => movementInSchema.parse({ quantity: 1, responsible: "vitor" })).not.toThrow();
  });

  it("rejects quantity of zero", () => {
    expect(() => movementInSchema.parse({ ...validIn, quantity: 0 })).toThrow();
  });

  it("rejects negative quantity", () => {
    expect(() => movementInSchema.parse({ ...validIn, quantity: -3 })).toThrow();
  });

  it("rejects decimal quantity", () => {
    expect(() => movementInSchema.parse({ ...validIn, quantity: 1.5 })).toThrow();
  });

  it("rejects empty responsible", () => {
    expect(() => movementInSchema.parse({ ...validIn, responsible: "" })).toThrow();
  });

  it("rejects whitespace-only responsible", () => {
    expect(() => movementInSchema.parse({ ...validIn, responsible: "   " })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// movementOutSchema
// ---------------------------------------------------------------------------

describe("movementOutSchema", () => {
  const validOut = { quantity: 2, reason: "consumo em producao", responsible: "vitor" };

  it("accepts a valid OUT movement", () => {
    expect(() => movementOutSchema.parse(validOut)).not.toThrow();
  });

  it("rejects quantity of zero", () => {
    expect(() => movementOutSchema.parse({ ...validOut, quantity: 0 })).toThrow();
  });

  it("rejects negative quantity", () => {
    expect(() => movementOutSchema.parse({ ...validOut, quantity: -1 })).toThrow();
  });

  it("rejects decimal quantity", () => {
    expect(() => movementOutSchema.parse({ ...validOut, quantity: 0.9 })).toThrow();
  });

  it("rejects empty reason (required for OUT)", () => {
    expect(() => movementOutSchema.parse({ ...validOut, reason: "" })).toThrow();
  });

  it("rejects whitespace-only reason", () => {
    expect(() => movementOutSchema.parse({ ...validOut, reason: "   " })).toThrow();
  });

  it("rejects missing reason", () => {
    const { reason: _reason, ...withoutReason } = validOut;
    expect(() => movementOutSchema.parse(withoutReason)).toThrow();
  });

  it("rejects empty responsible", () => {
    expect(() => movementOutSchema.parse({ ...validOut, responsible: "" })).toThrow();
  });
});
