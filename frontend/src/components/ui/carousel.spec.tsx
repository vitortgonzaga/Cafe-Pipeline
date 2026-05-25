import { describe, it, expect } from "vitest";
import * as CarouselModule from "./carousel";

describe("Carousel", () => {
  it("exporta componentes do carrossel", () => {
    expect(CarouselModule.Carousel).toBeDefined();
    expect(CarouselModule.CarouselContent).toBeDefined();
    expect(CarouselModule.CarouselItem).toBeDefined();
  });
});
