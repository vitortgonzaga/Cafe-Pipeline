import express from "express";
import cors from "cors";
import morgan from "morgan";
import { healthRoutes } from "./routes/health.routes";
import { itemRoutes } from "./routes/item.routes";
import { errorHandler } from "./middlewares/error-handler";
import { AppError } from "./errors/app-error";

export const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(healthRoutes);
app.use("/api", itemRoutes);
app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found", "ROUTE_NOT_FOUND"));
});

app.use(errorHandler);
