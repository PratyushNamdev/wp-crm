"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppImageMessage = exports.sendWhatsAppTextMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../utils/env");
const logger_1 = require("../utils/logger");
const postWhatsAppMessage = async (to, payload) => {
    const url = `https://graph.facebook.com/v22.0/${env_1.env.phoneNumberId}/messages`;
    try {
        const response = await axios_1.default.post(url, payload, {
            headers: {
                Authorization: `Bearer ${env_1.env.whatsappToken}`,
                "Content-Type": "application/json"
            },
            timeout: 10000
        });
        logger_1.logger.info("WhatsApp message sent successfully", {
            to,
            type: payload.type,
            messageId: response.data?.messages?.[0]?.id
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to send WhatsApp message", {
            to,
            type: payload.type,
            error: axios_1.default.isAxiosError(error)
                ? {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                }
                : String(error)
        });
        throw error;
    }
};
const sendWhatsAppTextMessage = async ({ to, text }) => {
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
            preview_url: false,
            body: text
        }
    };
    await postWhatsAppMessage(to, payload);
};
exports.sendWhatsAppTextMessage = sendWhatsAppTextMessage;
const sendWhatsAppImageMessage = async ({ to, imageUrl, caption }) => {
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "image",
        image: {
            link: imageUrl
        }
    };
    if (caption) {
        payload.image.caption = caption;
    }
    await postWhatsAppMessage(to, payload);
};
exports.sendWhatsAppImageMessage = sendWhatsAppImageMessage;
