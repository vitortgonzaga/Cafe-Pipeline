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
router.get("/items/:id", itemController.getById);
router.put("/items/:id", itemController.update);
router.delete("/items/:id", itemController.delete);
router.post("/items/:id/movements/in", itemController.addStock);
router.post("/items/:id/movements/out", itemController.consumeStock);
router.get("/items/:id/movements", itemController.listMovements);

export { router as itemRoutes };
