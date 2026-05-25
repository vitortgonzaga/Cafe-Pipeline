import { describe, it, expect } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  it("retorna HTML de fallback com título e ações", () => {
    const html = renderErrorPage();

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("This page didn't load");
    expect(html).toContain('onclick="location.reload()"');
    expect(html).toContain('href="/"');
  });
});
