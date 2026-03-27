"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
exports.webhookRouter = (0, express_1.Router)();
exports.webhookRouter.get("/webhook", webhookController_1.verifyWebhook);
exports.webhookRouter.post("/webhook", webhookController_1.receiveWebhookMessage);
