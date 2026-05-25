import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("renderiza sem erros", () => {
    render(<Separator decorative />);
    expect(screen.getByRole("none")).toBeInTheDocument();
  });
});
