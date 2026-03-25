import { Router } from "express";
import { receiveWebhookMessage, verifyWebhook } from "../controllers/webhookController";

export const webhookRouter = Router();

webhookRouter.get("/webhook", verifyWebhook);
webhookRouter.post("/webhook", receiveWebhookMessage);
