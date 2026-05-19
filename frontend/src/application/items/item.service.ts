import type { CafeItem } from "@/domain/items/cafe-item";
import type { StockMovement } from "@/domain/items/stock-movement";
import type { IItemRepository } from "@/data/items/item-repository.interface";
import type { CreateItemRequestDTO, UpdateItemRequestDTO } from "@/data/items/dto/item-request.dto";
import type {
  MovementInRequestDTO,
  MovementOutRequestDTO,
} from "@/data/items/dto/movement-request.dto";

export class ItemService {
  constructor(private readonly repository: IItemRepository) {}

  list = (): Promise<CafeItem[]> => this.repository.list();

  getById = (id: string): Promise<CafeItem> => this.repository.getById(id);

  create = (payload: CreateItemRequestDTO): Promise<CafeItem> => this.repository.create(payload);

  update = (id: string, payload: UpdateItemRequestDTO): Promise<CafeItem> =>
    this.repository.update(id, payload);

  remove = (id: string): Promise<void> => this.repository.remove(id);

  addStock = (id: string, payload: MovementInRequestDTO): Promise<CafeItem> =>
    this.repository.addStock(id, payload);

  consumeStock = (id: string, payload: MovementOutRequestDTO): Promise<CafeItem> =>
    this.repository.consumeStock(id, payload);

  listMovements = (id: string): Promise<StockMovement[]> => this.repository.listMovements(id);
}
