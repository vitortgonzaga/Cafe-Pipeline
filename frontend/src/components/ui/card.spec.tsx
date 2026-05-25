import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("renderiza sem erros", () => {
    render(<Card><CardHeader><CardTitle>Título</CardTitle></CardHeader></Card>);
    expect(screen.getByText("Título")).toBeInTheDocument();
  });
});
