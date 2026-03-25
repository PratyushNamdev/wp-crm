import { app } from "./app";
import { env } from "./utils/env";
import { logger } from "./utils/logger";

app.listen(env.port, () => {
  logger.info(`Server is running on port ${env.port}`);
});
