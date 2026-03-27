import { app } from "./app";
import { env } from "./utils/env";
import { logger } from "./utils/logger";

app.listen(env.port, () => {
  logger.info(`Server is running on port ${env.port}`);
  logger.info("Local health check", { url: `http://localhost:${env.port}/health` });
  logger.info("Local webhook verification URL", {
    url: `http://localhost:${env.port}/webhook`
  });

  if (env.publicBaseUrl) {
    logger.info("Public webhook callback URL for Meta", {
      url: `${env.publicBaseUrl.replace(/\/$/, "")}/webhook`
    });
  } else {
    logger.info("Set PUBLIC_BASE_URL after starting ngrok to print the Meta callback URL");
  }
});
