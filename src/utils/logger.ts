export interface Logger {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

const formatMessage = (level: string, message: string, meta?: unknown): string => {
  const timestamp = new Date().toISOString();
  const metaString = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

export const logger: Logger = {
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
