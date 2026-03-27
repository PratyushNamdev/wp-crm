import axios from "axios";
import { env } from "../utils/env";
import { logger } from "../utils/logger";

export interface WhatsAppTextMessagePayload {
  to: string;
  text: string;
}

export interface WhatsAppImageMessagePayload {
  to: string;
  imageUrl: string;
  caption?: string;
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

interface WhatsAppImageMessageRequest {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "image";
  image: {
    link: string;
    caption?: string;
  };
}

type WhatsAppRequestPayload = WhatsAppTextMessageRequest | WhatsAppImageMessageRequest;

const postWhatsAppMessage = async (
  to: string,
  payload: WhatsAppRequestPayload
): Promise<void> => {
  const url = `https://graph.facebook.com/v22.0/${env.phoneNumberId}/messages`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${env.whatsappToken}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    logger.info("WhatsApp message sent successfully", {
      to,
      type: payload.type,
      messageId: response.data?.messages?.[0]?.id
    });
  } catch (error) {
    logger.error("Failed to send WhatsApp message", {
      to,
      type: payload.type,
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

export const sendWhatsAppTextMessage = async ({
  to,
  text
}: WhatsAppTextMessagePayload): Promise<void> => {
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

  await postWhatsAppMessage(to, payload);
};

export const sendWhatsAppImageMessage = async ({
  to,
  imageUrl,
  caption
}: WhatsAppImageMessagePayload): Promise<void> => {
  const payload: WhatsAppImageMessageRequest = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "image",
    image: {
      link: imageUrl
    }
  };

  if (caption) {
    payload.image.caption = caption;
  }

  await postWhatsAppMessage(to, payload);
};
