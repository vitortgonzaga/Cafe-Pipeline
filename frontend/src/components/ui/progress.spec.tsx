import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("Progress", () => {
  it("renderiza sem erros", () => {
    render(<Progress value={40} aria-label="progresso" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
