import type { HttpClient } from "@/http/http-client";
import type { CafeItem } from "@/domain/items/cafe-item";
import type { StockMovement } from "@/domain/items/stock-movement";
import type { IItemRepository } from "./item-repository.interface";
import type { CreateItemRequestDTO, UpdateItemRequestDTO } from "./dto/item-request.dto";
import type { CafeItemResponseDTO } from "./dto/item-response.dto";
import type { MovementInRequestDTO, MovementOutRequestDTO } from "./dto/movement-request.dto";
import type { StockMovementResponseDTO } from "./dto/movement-response.dto";
import { toCafeItem } from "./mappers/item.mapper";
import { toStockMovement } from "./mappers/stock-movement.mapper";

export class ItemHttpRepository implements IItemRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<CafeItem[]> {
    const { data } = await this.http.request<CafeItemResponseDTO[]>({
      url: "/items",
      method: "GET",
    });
    return data.map(toCafeItem);
  }

  async getById(id: string): Promise<CafeItem> {
    const { data } = await this.http.request<CafeItemResponseDTO>({
      url: `/items/${id}`,
      method: "GET",
    });
    return toCafeItem(data);
  }

  async create(payload: CreateItemRequestDTO): Promise<CafeItem> {
    const { data } = await this.http.request<CafeItemResponseDTO, CreateItemRequestDTO>({
      url: "/items",
      method: "POST",
      body: payload,
    });
    return toCafeItem(data);
  }

  async update(id: string, payload: UpdateItemRequestDTO): Promise<CafeItem> {
    const { data } = await this.http.request<CafeItemResponseDTO, UpdateItemRequestDTO>({
      url: `/items/${id}`,
      method: "PUT",
      body: payload,
    });
    return toCafeItem(data);
  }

  async remove(id: string): Promise<void> {
    await this.http.request<void>({ url: `/items/${id}`, method: "DELETE" });
  }

  async addStock(id: string, payload: MovementInRequestDTO): Promise<CafeItem> {
    const { data } = await this.http.request<CafeItemResponseDTO, MovementInRequestDTO>({
      url: `/items/${id}/movements/in`,
      method: "POST",
      body: payload,
    });
    return toCafeItem(data);
  }

  async consumeStock(id: string, payload: MovementOutRequestDTO): Promise<CafeItem> {
    const { data } = await this.http.request<CafeItemResponseDTO, MovementOutRequestDTO>({
      url: `/items/${id}/movements/out`,
      method: "POST",
      body: payload,
    });
    return toCafeItem(data);
  }

  async listMovements(id: string): Promise<StockMovement[]> {
    const { data } = await this.http.request<StockMovementResponseDTO[]>({
      url: `/items/${id}/movements`,
      method: "GET",
    });
    return data.map((movement) => toStockMovement(movement));
  }
}
