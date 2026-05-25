import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renderiza sem erros", () => {
    render(<Textarea aria-label="obs" />);
    expect(screen.getByLabelText("obs")).toBeInTheDocument();
  });
});
