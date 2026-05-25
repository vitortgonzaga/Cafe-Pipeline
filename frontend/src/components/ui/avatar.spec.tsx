import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback } from "./avatar";

describe("Avatar", () => {
  it("renderiza sem erros", () => {
    render(<Avatar><AvatarFallback>CP</AvatarFallback></Avatar>);
    expect(screen.getByText("CP")).toBeInTheDocument();
  });
});
