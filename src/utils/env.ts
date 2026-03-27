import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  port: number;
  verifyToken: string;
  whatsappToken: string;
  phoneNumberId: string;
  publicBaseUrl?: string;
  GROQ_API_KEY?: string;
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
  phoneNumberId: getRequiredEnv("PHONE_NUMBER_ID"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL?.trim() || undefined,
  GROQ_API_KEY: process.env.GROQ_API_KEY?.trim() || undefined,
};
