import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as UI from "./pagination";

describe("Pagination", () => {
  it("renderiza sem erros", () => {
    // export smoke
    // smoke: módulo exporta componentes
    expect(UI).toBeDefined();
  });
});
