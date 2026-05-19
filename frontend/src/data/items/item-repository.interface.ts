import type { CafeItem } from "@/domain/items/cafe-item";
import type { StockMovement } from "@/domain/items/stock-movement";
import type { CreateItemRequestDTO, UpdateItemRequestDTO } from "./dto/item-request.dto";
import type { MovementInRequestDTO, MovementOutRequestDTO } from "./dto/movement-request.dto";

export interface IItemRepository {
  list(): Promise<CafeItem[]>;
  getById(id: string): Promise<CafeItem>;
  create(payload: CreateItemRequestDTO): Promise<CafeItem>;
  update(id: string, payload: UpdateItemRequestDTO): Promise<CafeItem>;
  remove(id: string): Promise<void>;
  addStock(id: string, payload: MovementInRequestDTO): Promise<CafeItem>;
  consumeStock(id: string, payload: MovementOutRequestDTO): Promise<CafeItem>;
  listMovements(id: string): Promise<StockMovement[]>;
}
