import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Switch } from "./switch";

describe("Switch", () => {
  it("renderiza sem erros", () => {
    render(<Switch aria-label="ativo" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
