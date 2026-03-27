import { Request, Response } from "express";
import {
  messageProcessorService,
  ProcessedReply,
  ReplyProduct
} from "../services/messageProcessorService";
import {
  sendWhatsAppImageMessage,
  sendWhatsAppTextMessage
} from "../services/whatsappService";
import { env } from "../utils/env";
import { logger } from "../utils/logger";

interface WhatsAppWebhookBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          type?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
}

interface IncomingTextMessage {
  from: string;
  text: string;
}

const extractIncomingMessages = (body: WhatsAppWebhookBody): IncomingTextMessage[] => {
  const incomingMessages: IncomingTextMessage[] = [];

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        const from = message.from;
        const text = message.text?.body;

        if (message.type !== "text" || !from || !text) {
          continue;
        }

        incomingMessages.push({ from, text });
      }
    }
  }

  return incomingMessages;
};

const getReplyProducts = (reply: ProcessedReply): ReplyProduct[] => {
  if (!reply.products || reply.products.length === 0) {
    return [];
  }

  if (reply.type === "product") {
    return [reply.products[0]];
  }

  if (reply.type === "multi_product") {
    return reply.products;
  }

  return [];
};

const sendProcessedReply = async (to: string, reply: ProcessedReply): Promise<void> => {
  if (reply.message.trim()) {
    await sendWhatsAppTextMessage({ to, text: reply.message });
  }

  const products = getReplyProducts(reply);

  for (const product of products) {
    await sendWhatsAppImageMessage({
      to,
      imageUrl: product.image,
      caption: product.name
    });
  }
};

export const verifyWebhook = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.verifyToken && typeof challenge === "string") {
    logger.info("Webhook verification successful");
    res.status(200).send(challenge);
    return;
  }

  logger.warn("Webhook verification failed", { mode, token });
  res.sendStatus(403);
};

export const receiveWebhookMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as WhatsAppWebhookBody;
    const incomingMessages = extractIncomingMessages(body);

    if (incomingMessages.length === 0) {
      logger.info("Webhook received with no processable text messages", body);
      res.status(200).json({ received: true, processed: false });
      return;
    }

    for (const incoming of incomingMessages) {
      logger.info("Incoming WhatsApp message received", incoming);

      const reply = await messageProcessorService.generateReply(incoming.text);
      logger.info("Processed WhatsApp reply", {
        to: incoming.from,
        type: reply.type,
        productCount: reply.products?.length ?? 0
      });

      await sendProcessedReply(incoming.from, reply);
    }

    res.status(200).json({ received: true, processed: true, messageCount: incomingMessages.length });
  } catch (error) {
    logger.error("Error while handling webhook message", {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ received: false, error: "Internal server error" });
  }
};
