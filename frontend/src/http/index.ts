import { AxiosHttpClient } from "./axios-http-client";
import type { HttpClient } from "./http-client";

const DEFAULT_API_URL = "http://localhost:3001/api";

function resolveBaseUrl(): string {
  const fromEnv = import.meta.env?.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  return DEFAULT_API_URL;
}

export const httpClient: HttpClient = new AxiosHttpClient({
  baseURL: resolveBaseUrl(),
});

export type { HttpClient, HttpRequest, HttpResponse, HttpMethod } from "./http-client";
export { HttpError } from "./http-error";
export { AxiosHttpClient } from "./axios-http-client";
export { resolveBaseUrl };
