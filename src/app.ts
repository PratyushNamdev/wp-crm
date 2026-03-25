import express, { NextFunction, Request, Response } from "express";
import { healthRouter } from "./routes/healthRoutes";
import { webhookRouter } from "./routes/webhookRoutes";
import { logger } from "./utils/logger";

export const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(healthRouter);
app.use(webhookRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled application error", { message: err.message });
  res.status(500).json({ error: "Internal server error" });
});
