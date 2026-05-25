import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

describe("Accordion", () => {
  it("renderiza sem erros", () => {
    render(<Accordion type="single" collapsible><AccordionItem value="1"><AccordionTrigger>Item</AccordionTrigger><AccordionContent>Corpo</AccordionContent></AccordionItem></Accordion>);
    expect(screen.getByText("Item")).toBeInTheDocument();
  });
});
