import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { AxiosHttpClient } from "./axios-http-client";
import { HttpError } from "./http-error";

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    default: {
      ...actual.default,
      create: vi.fn(),
      isAxiosError: actual.default.isAxiosError,
    },
    isAxiosError: actual.isAxiosError,
  };
});

describe("AxiosHttpClient", () => {
  const requestMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue({ request: requestMock } as never);
  });

  it("envia requisição e retorna dados normalizados", async () => {
    requestMock.mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
      headers: { "x-test": "1" },
    });

    const client = new AxiosHttpClient({ baseURL: "http://api.test" });
    const response = await client.request<{ ok: boolean }>({
      url: "/items",
      method: "GET",
    });

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/items", method: "GET" }),
    );
    expect(response).toEqual({
      status: 200,
      data: { ok: true },
      headers: { "x-test": "1" },
    });
  });

  it("converte erro axios em HttpError com payload da API", async () => {
    const axiosError = {
      isAxiosError: true,
      message: "Request failed",
      response: {
        status: 422,
        data: {
          error: { code: "VALIDATION", message: "Dados inválidos", details: { field: "name" } },
        },
      },
    };
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
    requestMock.mockRejectedValueOnce(axiosError);

    const client = new AxiosHttpClient({ baseURL: "http://api.test" });

    await expect(
      client.request({ url: "/items", method: "POST", body: {} }),
    ).rejects.toMatchObject({
      status: 422,
      message: "Dados inválidos",
      code: "VALIDATION",
      details: { field: "name" },
    } satisfies Partial<HttpError>);
  });

  it("converte erro genérico em HttpError", async () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
    requestMock.mockRejectedValueOnce(new Error("offline"));

    const client = new AxiosHttpClient({ baseURL: "http://api.test" });

    await expect(client.request({ url: "/items", method: "GET" })).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});
