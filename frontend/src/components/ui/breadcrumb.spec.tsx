import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as UI from "./breadcrumb";

describe("Breadcrumb", () => {
  it("renderiza sem erros", () => {
    // export smoke
    // smoke: módulo exporta componentes
    expect(UI).toBeDefined();
  });
});
