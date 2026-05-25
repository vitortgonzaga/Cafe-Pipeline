import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renderiza sem erros", () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId("sk")).toBeInTheDocument();
  });
});
