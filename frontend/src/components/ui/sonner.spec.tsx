import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "./sonner";

describe("Sonner", () => {
  it("renderiza sem erros", () => {
    render(<Toaster />);
    expect(document.body).toBeTruthy();
  });
});
