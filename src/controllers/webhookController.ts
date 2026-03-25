import { Request, Response } from "express";
import { messageProcessorService } from "../services/messageProcessorService";
import { sendWhatsAppTextMessage } from "../services/whatsappService";
import { env } from "../utils/env";
import { logger } from "../utils/logger";

interface WhatsAppWebhookBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
}

const extractIncomingMessage = (body: WhatsAppWebhookBody): { from: string; text: string } | null => {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;
  const text = message?.text?.body;

  if (!from || !text) {
    return null;
  }

  return { from, text };
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
    const incoming = extractIncomingMessage(req.body as WhatsAppWebhookBody);

    if (!incoming) {
      logger.warn("No valid incoming WhatsApp text message found in webhook payload", req.body);
      res.status(200).json({ received: true, processed: false });
      return;
    }

    const { from, text } = incoming;
    logger.info("Incoming WhatsApp message received", { from, text });

    const replyText = messageProcessorService.generateReply(text);
    await sendWhatsAppTextMessage({ to: from, text: replyText });

    res.status(200).json({ received: true, processed: true });
  } catch (error) {
    logger.error("Error while handling webhook message", {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ received: false, error: "Internal server error" });
  }
};
