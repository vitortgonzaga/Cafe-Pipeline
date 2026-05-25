import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renderiza sem erros", () => {
    render(<Checkbox aria-label="aceitar" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});
