import { describe, it, expect } from "vitest";
import * as ChartModule from "./chart";

describe("Chart", () => {
  it("exporta ChartContainer e helpers", () => {
    expect(ChartModule.ChartContainer).toBeDefined();
    expect(ChartModule.ChartTooltip).toBeDefined();
  });
});
