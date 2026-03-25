import axios from "axios";
import { env } from "../utils/env";
import { logger } from "../utils/logger";

export interface WhatsAppMessagePayload {
  to: string;
  text: string;
}

interface WhatsAppTextMessageRequest {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text";
  text: {
    preview_url: boolean;
    body: string;
  };
}

export const sendWhatsAppTextMessage = async ({ to, text }: WhatsAppMessagePayload): Promise<void> => {
  const url = `https://graph.facebook.com/v18.0/${env.phoneNumberId}/messages`;

  const payload: WhatsAppTextMessageRequest = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: text
    }
  };

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${env.whatsappToken}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    logger.info("WhatsApp message sent successfully", { to });
  } catch (error) {
    logger.error("Failed to send WhatsApp message", {
      to,
      error: axios.isAxiosError(error)
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
