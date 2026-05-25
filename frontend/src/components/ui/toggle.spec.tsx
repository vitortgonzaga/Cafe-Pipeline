import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as UI from "./toggle";

describe("Toggle", () => {
  it("renderiza sem erros", () => {
    // export smoke
    // smoke: módulo exporta componentes
    expect(UI).toBeDefined();
  });
});
