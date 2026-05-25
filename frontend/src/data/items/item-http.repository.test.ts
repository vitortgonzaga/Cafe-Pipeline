import { describe, it, expect, vi } from "vitest";
import { ItemHttpRepository } from "./item-http.repository";
import type { HttpClient } from "@/http/http-client";
import type { CreateItemRequestDTO, UpdateItemRequestDTO } from "./dto/item-request.dto";
import type { MovementInRequestDTO, MovementOutRequestDTO } from "./dto/movement-request.dto";

describe("ItemHttpRepository", () => {
  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  const repository = new ItemHttpRepository(mockHttpClient);

  it("should fetch a list of items", async () => {
    const mockResponse = [{ id: "1", name: "Item 1" }];
    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const result = await repository.list();

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items",
      method: "GET",
    });
    expect(result[0].id).toEqual(mockResponse[0].id);
    expect(result[0].name).toEqual(mockResponse[0].name);
  });

  it("should fetch an item by ID", async () => {
    const mockResponse = { id: "1", name: "Item 1" };
    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const { id, name } = await repository.getById("1");
    const result = { id, name };

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items/1",
      method: "GET",
    });
    expect(result).toEqual(mockResponse);
  });

  it("should create a new item", async () => {
    const payload: CreateItemRequestDTO = {
      name: "New Item",
      category: "COFFEE",
      quantity: 10,
      minQuantity: 5,
      unit: "UNIT",
      criticality: "LOW",
    };
    const mockResponse = { id: "1", name: "New Item" };
    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const { id, name } = await repository.create(payload);
    const result = { id, name };

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items",
      method: "POST",
      body: payload,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should update an item", async () => {
    const payload: UpdateItemRequestDTO = {
      name: "Updated Item",
      category: "COFFEE",
      quantity: 10,
      minQuantity: 5,
      unit: "UNIT",
      criticality: "LOW",
    };
    const mockResponse = {
      id: "1",
      name: "Updated Item",
    };
    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const { id, name } = await repository.update("1", payload);
    const result = { id, name };

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items/1",
      method: "PUT",
      body: payload,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should delete an item", async () => {
    (mockHttpClient.request as any).mockResolvedValueOnce({});

    await repository.remove("1");

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items/1",
      method: "DELETE",
    });
  });

  it("should add stock to an item", async () => {
    const payload: MovementInRequestDTO = { quantity: 10, reason: "Restock", responsible: "Admin" };
    const mockResponse = { id: "1", name: "Item 1", quantity: 20 };
    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const { id, name, quantity } = await repository.addStock("1", payload);
    const result = { id, name, quantity };

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items/1/movements/in",
      method: "POST",
      body: payload,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should consume stock from an item", async () => {
    const payload: MovementOutRequestDTO = { quantity: 5, reason: "Sale", responsible: "Admin" };
    const mockResponse = {
      id: "1",
      name: "Item 1",
      quantity: 5,
      category: "COFFEE",
      minQuantity: 1,
      unit: "UNIT",
      criticality: "MEDIUM",
      status: "AVAILABLE",
      createdAt: new Date("2026-05-20T00:00:00.000Z"),
      updatedAt: new Date("2026-05-20T00:00:00.000Z"),
    };

    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const result = await repository.consumeStock("1", payload);

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items/1/movements/out",
      method: "POST",
      body: payload,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should list movements for an item", async () => {
    const mockResponse = [
      {
        id: "1",
        type: "IN",
        quantity: 10,
        reason: "Restock",
        responsible: "Admin",
        createdAt: "2026-05-20T00:00:00.000Z",
      },
    ];

    const expectedResponse = [
      {
        id: "1",
        type: "IN",
        quantity: 10,
        reason: "Restock",
        responsible: "Admin",
        createdAt: new Date("2026-05-20T00:00:00.000Z"),
      },
    ];

    (mockHttpClient.request as any).mockResolvedValueOnce({ data: mockResponse });

    const result = await repository.listMovements("1");

    expect(mockHttpClient.request).toHaveBeenCalledWith({
      url: "/items/1/movements",
      method: "GET",
    });
    expect(result).toEqual(expectedResponse);
  });
});
