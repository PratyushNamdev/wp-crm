"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const healthRoutes_1 = require("./routes/healthRoutes");
const webhookRoutes_1 = require("./routes/webhookRoutes");
const logger_1 = require("./utils/logger");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.use(healthRoutes_1.healthRouter);
exports.app.use(webhookRoutes_1.webhookRouter);
exports.app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});
exports.app.use((err, _req, res, _next) => {
    logger_1.logger.error("Unhandled application error", { message: err.message });
    res.status(500).json({ error: "Internal server error" });
});
