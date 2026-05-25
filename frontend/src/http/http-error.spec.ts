import { describe, it, expect } from "vitest";
import { HttpError } from "./http-error";

describe("HttpError", () => {
  it("cria erro com status, mensagem e metadados opcionais", () => {
    const error = new HttpError(404, "Não encontrado", "NOT_FOUND", { id: "1" });

    expect(error.name).toBe("HttpError");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Não encontrado");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.details).toEqual({ id: "1" });
  });

  it("identifica instâncias com isHttpError", () => {
    const error = new HttpError(500, "Falha");
    expect(HttpError.isHttpError(error)).toBe(true);
    expect(HttpError.isHttpError(new Error("x"))).toBe(false);
  });
});
