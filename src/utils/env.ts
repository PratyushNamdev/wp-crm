import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  port: number;
  verifyToken: string;
  whatsappToken: string;
  phoneNumberId: string;
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  port: Number(process.env.PORT ?? 3000),
  verifyToken: getRequiredEnv("VERIFY_TOKEN"),
  whatsappToken: getRequiredEnv("WHATSAPP_TOKEN"),
  phoneNumberId: getRequiredEnv("PHONE_NUMBER_ID")
};
