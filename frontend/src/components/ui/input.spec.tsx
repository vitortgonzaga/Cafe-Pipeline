import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("renderiza sem erros", () => {
    render(<Input aria-label="nome" />);
    expect(screen.getByLabelText("nome")).toBeInTheDocument();
  });
});
