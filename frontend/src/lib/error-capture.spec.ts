import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consumeLastCapturedError } from "./error-capture";

describe("consumeLastCapturedError", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna undefined quando não há erro capturado", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captura erro global e consome uma única vez", () => {
    const error = new Error("boom");
    globalThis.dispatchEvent(new ErrorEvent("error", { error }));

    expect(consumeLastCapturedError()).toBe(error);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("expira captura após TTL", () => {
    const error = new Error("stale");
    globalThis.dispatchEvent(new ErrorEvent("error", { error }));

    vi.advanceTimersByTime(5_001);
    expect(consumeLastCapturedError()).toBeUndefined();
  });
});
