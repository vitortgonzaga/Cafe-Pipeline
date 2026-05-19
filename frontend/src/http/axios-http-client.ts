import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { HttpClient, HttpRequest, HttpResponse } from "./http-client";
import { HttpError } from "./http-error";

export interface AxiosHttpClientOptions {
  baseURL: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

interface ApiErrorEnvelope {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class AxiosHttpClient implements HttpClient {
  private readonly instance: AxiosInstance;

  constructor(options: AxiosHttpClientOptions) {
    this.instance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeoutMs ?? 15_000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.defaultHeaders,
      },
    });
  }

  async request<TResponse, TBody>(request: HttpRequest<TBody>): Promise<HttpResponse<TResponse>> {
    const config: AxiosRequestConfig = {
      url: request.url,
      method: request.method,
      data: request.body,
      headers: request.headers,
      params: request.params,
      signal: request.signal,
    };

    try {
      const response = await this.instance.request<TResponse>(config);
      return this.toHttpResponse(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private toHttpResponse<TResponse>(response: AxiosResponse<TResponse>): HttpResponse<TResponse> {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(response.headers ?? {})) {
      if (value !== undefined) headers[key] = String(value);
    }
    return {
      status: response.status,
      data: response.data,
      headers,
    };
  }

  private normalizeError(error: unknown): HttpError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorEnvelope>;
      const status = axiosError.response?.status ?? 0;
      const payload = axiosError.response?.data;
      const apiError = payload?.error;
      const message = apiError?.message ?? axiosError.message ?? "HTTP request failed";
      return new HttpError(status, message, apiError?.code, apiError?.details);
    }

    if (error instanceof Error) {
      return new HttpError(0, error.message);
    }

    return new HttpError(0, "Unknown HTTP error");
  }
}
