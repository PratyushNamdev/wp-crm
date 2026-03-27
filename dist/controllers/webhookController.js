"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveWebhookMessage = exports.verifyWebhook = void 0;
const messageProcessorService_1 = require("../services/messageProcessorService");
const whatsappService_1 = require("../services/whatsappService");
const env_1 = require("../utils/env");
const logger_1 = require("../utils/logger");
const extractIncomingMessages = (body) => {
    const incomingMessages = [];
    for (const entry of body.entry ?? []) {
        for (const change of entry.changes ?? []) {
            for (const message of change.value?.messages ?? []) {
                const from = message.from;
                const text = message.text?.body;
                if (message.type !== "text" || !from || !text) {
                    continue;
                }
                incomingMessages.push({ from, text });
            }
        }
    }
    return incomingMessages;
};
const getReplyProducts = (reply) => {
    if (!reply.products || reply.products.length === 0) {
        return [];
    }
    if (reply.type === "product") {
        return [reply.products[0]];
    }
    if (reply.type === "multi_product") {
        return reply.products;
    }
    return [];
};
const sendProcessedReply = async (to, reply) => {
    if (reply.message.trim()) {
        await (0, whatsappService_1.sendWhatsAppTextMessage)({ to, text: reply.message });
    }
    const products = getReplyProducts(reply);
    for (const product of products) {
        await (0, whatsappService_1.sendWhatsAppImageMessage)({
            to,
            imageUrl: product.image,
            caption: product.name
        });
    }
};
const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === env_1.env.verifyToken && typeof challenge === "string") {
        logger_1.logger.info("Webhook verification successful");
        res.status(200).send(challenge);
        return;
    }
    logger_1.logger.warn("Webhook verification failed", { mode, token });
    res.sendStatus(403);
};
exports.verifyWebhook = verifyWebhook;
const receiveWebhookMessage = async (req, res) => {
    try {
        const body = req.body;
        const incomingMessages = extractIncomingMessages(body);
        if (incomingMessages.length === 0) {
            logger_1.logger.info("Webhook received with no processable text messages", body);
            res.status(200).json({ received: true, processed: false });
            return;
        }
        for (const incoming of incomingMessages) {
            logger_1.logger.info("Incoming WhatsApp message received", incoming);
            const reply = await messageProcessorService_1.messageProcessorService.generateReply(incoming.text);
            logger_1.logger.info("Processed WhatsApp reply", {
                to: incoming.from,
                type: reply.type,
                productCount: reply.products?.length ?? 0
            });
            await sendProcessedReply(incoming.from, reply);
        }
        res.status(200).json({ received: true, processed: true, messageCount: incomingMessages.length });
    }
    catch (error) {
        logger_1.logger.error("Error while handling webhook message", {
            error: error instanceof Error ? error.message : String(error)
        });
        res.status(500).json({ received: false, error: "Internal server error" });
    }
};
exports.receiveWebhookMessage = receiveWebhookMessage;
