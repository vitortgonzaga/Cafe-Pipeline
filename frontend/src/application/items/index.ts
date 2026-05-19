import { httpClient } from "@/http";
import { ItemHttpRepository } from "@/data/items/item-http.repository";
import { ItemService } from "./item.service";

const itemRepository = new ItemHttpRepository(httpClient);

export const itemService = new ItemService(itemRepository);
