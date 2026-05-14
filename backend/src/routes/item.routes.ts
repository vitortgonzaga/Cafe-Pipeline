import { Router } from "express";
import { ItemController } from "../controllers/item.controller";
import { ItemRepository } from "../repositories/item.repository";
import { ItemService } from "../services/item.service";

const itemRepository = new ItemRepository();
const itemService = new ItemService(itemRepository);
const itemController = new ItemController(itemService);

const router = Router();

router.post("/items", itemController.create);
router.get("/items", itemController.list);

export { router as itemRoutes };
