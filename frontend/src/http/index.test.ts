import { describe, it, expect, vi } from "vitest";
import { resolveBaseUrl } from "./index";

describe("resolveBaseUrl", () => {
  it("should return the default API URL if VITE_API_URL is not defined", () => {
    // Mock the environment variable
    vi.stubGlobal("import.meta", { env: {} });

    const result = resolveBaseUrl();
    expect(result).toBe("http://localhost:3001/api");
  });
});
