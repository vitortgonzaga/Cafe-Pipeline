import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
  it("renderiza sem erros", () => {
    render(<TooltipProvider><Tooltip><TooltipTrigger>Hover</TooltipTrigger><TooltipContent>Info</TooltipContent></Tooltip></TooltipProvider>);
    expect(screen.getByText("Hover")).toBeInTheDocument();
  });
});
