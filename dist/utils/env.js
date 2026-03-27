"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
exports.env = {
    port: Number(process.env.PORT ?? 3000),
    verifyToken: getRequiredEnv("VERIFY_TOKEN"),
    whatsappToken: getRequiredEnv("WHATSAPP_TOKEN"),
    phoneNumberId: getRequiredEnv("PHONE_NUMBER_ID"),
    publicBaseUrl: process.env.PUBLIC_BASE_URL?.trim() || undefined,
    GROQ_API_KEY: process.env.GROQ_API_KEY?.trim() || undefined,
};
