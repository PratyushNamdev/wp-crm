"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const formatMessage = (level, message, meta) => {
    const timestamp = new Date().toISOString();
    const metaString = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaString}`;
};
exports.logger = {
    info: (message, meta) => {
        console.log(formatMessage("INFO", message, meta));
    },
    warn: (message, meta) => {
        console.warn(formatMessage("WARN", message, meta));
    },
    error: (message, meta) => {
        console.error(formatMessage("ERROR", message, meta));
    }
};
