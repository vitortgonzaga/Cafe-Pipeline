import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

describe("Alert", () => {
  it("renderiza sem erros", () => {
    render(<Alert><AlertTitle>Atenção</AlertTitle><AlertDescription>Detalhe</AlertDescription></Alert>);
    expect(screen.getByText("Atenção")).toBeInTheDocument();
  });
});
