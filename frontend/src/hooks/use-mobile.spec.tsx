import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  let changeHandler: EventListener | undefined;

  beforeEach(() => {
    changeHandler = undefined;
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 500 });
    window.matchMedia = ((query: string): MediaQueryList => {
      const mediaQueryList: MediaQueryList = {
        matches: true,
        media: query,
        onchange: null,
        addEventListener: (_type, listener) => {
          if (typeof listener === "function") {
            changeHandler = listener as EventListener;
          }
        },
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      };

      return mediaQueryList;
    }) as typeof window.matchMedia;
  });

  afterEach(() => {
    changeHandler = undefined;
  });

  it("retorna true quando largura está abaixo do breakpoint", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("atualiza valor ao redimensionar", () => {
    const { result } = renderHook(() => useIsMobile());

    act(() => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
      changeHandler?.(new Event("change"));
    });

    expect(result.current).toBe(false);
  });
});
