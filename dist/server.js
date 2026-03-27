"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./utils/env");
const logger_1 = require("./utils/logger");
app_1.app.listen(env_1.env.port, () => {
    logger_1.logger.info(`Server is running on port ${env_1.env.port}`);
    logger_1.logger.info("Local health check", { url: `http://localhost:${env_1.env.port}/health` });
    logger_1.logger.info("Local webhook verification URL", {
        url: `http://localhost:${env_1.env.port}/webhook`
    });
    if (env_1.env.publicBaseUrl) {
        logger_1.logger.info("Public webhook callback URL for Meta", {
            url: `${env_1.env.publicBaseUrl.replace(/\/$/, "")}/webhook`
        });
    }
    else {
        logger_1.logger.info("Set PUBLIC_BASE_URL after starting ngrok to print the Meta callback URL");
    }
});
