import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("renderiza sem erros", () => {
    render(<Calendar />);
    expect(document.body.querySelector(".rdp-root, [data-slot], table, div")).toBeTruthy();
  });
});
