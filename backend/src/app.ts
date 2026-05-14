import express from "express";
import cors from "cors";
import { healthRoutes } from "./routes/health.routes";
import { itemRoutes } from "./routes/item.routes";
import { errorHandler } from "./middlewares/error-handler";

export const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use("/api", itemRoutes);

app.use(errorHandler);
