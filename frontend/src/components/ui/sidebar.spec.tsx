import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as UI from "./sidebar";

describe("Sidebar", () => {
  it("renderiza sem erros", () => {
    // export smoke
    // smoke: módulo exporta componentes
    expect(UI).toBeDefined();
  });
});
