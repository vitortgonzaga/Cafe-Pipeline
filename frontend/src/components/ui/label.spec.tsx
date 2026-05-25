import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label", () => {
  it("renderiza sem erros", () => {
    render(<Label htmlFor="x">Nome</Label>);
    expect(screen.getByText("Nome")).toBeInTheDocument();
  });
});
