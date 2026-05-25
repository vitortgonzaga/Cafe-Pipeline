import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("mescla classes condicionais e remove conflitos do tailwind", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });
});
