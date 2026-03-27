import fetch from "node-fetch";
import { env } from "../utils/env";
import { logger } from "../utils/logger";

export interface ReplyProduct {
  name: string;
  image: string;
}

export interface ProcessedReply {
  type: "text" | "product" | "multi_product";
  message: string;
  products?: ReplyProduct[];
}

export interface MessageProcessorService {
  generateReply: (incomingText: string) => Promise<ProcessedReply>;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

type Product = {
  name: string;
  price: string;
  availability: string;
  details: string;
  image: string;
};

const products: Product[] = [
  {
    name: "Premium Cotton Kurti",
    price: "Rs. 999",
    availability: "Yes",
    details: "Cotton kurti, sizes S-XL, breathable fabric, COD available",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e1"
  },
  {
    name: "Men's Casual Shirt",
    price: "Rs. 799",
    availability: "Yes",
    details: "Slim fit casual shirt, sizes M-XXL, multiple colors available",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"
  },
  {
    name: "Denim Jeans",
    price: "Rs. 1299",
    availability: "Limited stock",
    details: "Stretchable denim jeans, sizes 30-38, dark blue and black",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246"
  },
  {
    name: "Women's Ethnic Saree",
    price: "Rs. 1499",
    availability: "Yes",
    details: "Silk blend saree, festive wear, includes blouse piece",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c"
  },
  {
    name: "Sports Running Shoes",
    price: "Rs. 1999",
    availability: "Yes",
    details: "Lightweight running shoes, sizes 6-10, breathable mesh",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
  }
];

const formatProductsForPrompt = (productList: Product[]): string => {
  return productList
    .map(
      (product, index) => `
${index + 1}. ${product.name}
Price: ${product.price}
Availability: ${product.availability}
Details: ${product.details}
Image: ${product.image}`
    )
    .join("\n");
};

const isReplyProduct = (value: unknown): value is ReplyProduct => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === "string" && typeof candidate.image === "string";
};

const normalizeProcessedReply = (value: unknown): ProcessedReply | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const type = candidate.type;
  const message = candidate.message;
  const productsValue = candidate.products;

  if (
    type !== "text" &&
    type !== "product" &&
    type !== "multi_product"
  ) {
    return null;
  }

  if (typeof message !== "string") {
    return null;
  }

  const normalizedProducts = Array.isArray(productsValue)
    ? productsValue.filter(isReplyProduct)
    : undefined;

  return {
    type,
    message,
    products: normalizedProducts
  };
};

export const messageProcessorService: MessageProcessorService = {
  generateReply: async (incomingText: string): Promise<ProcessedReply> => {
    try {
      const productContext = formatProductsForPrompt(products);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY ?? ""}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `
You are a WhatsApp AI sales assistant for an Indian business.

Style:
- Talk like a real human
- Use natural Hinglish
- Keep replies short
- Friendly and slightly persuasive

Behavior:
- Suggest products when needed
- If user wants to buy, say:
  "Great! I'll have our team contact you shortly."

IMPORTANT OUTPUT FORMAT:
You must return only valid JSON.

Format:
{
  "type": "text" | "product" | "multi_product",
  "message": "your reply",
  "products": [
    {
      "name": "product name",
      "image": "image url"
    }
  ]
}
`
            },
            {
              role: "user",
              content: `
Available Products:
${productContext}

User message: "${incomingText}"
`
            }
          ]
        })
      });

      const data = (await response.json()) as GroqChatCompletionResponse;
      const aiText = data.choices?.[0]?.message?.content;

      if (!aiText) {
        throw new Error("Empty AI response");
      }

      try {
        const parsed = JSON.parse(aiText) as unknown;
        const normalizedReply = normalizeProcessedReply(parsed);

        if (normalizedReply) {
          return normalizedReply;
        }

        logger.warn("AI response JSON did not match expected reply schema", { aiText });
      } catch (error) {
        logger.warn("Failed to parse AI JSON response", {
          error: error instanceof Error ? error.message : String(error),
          aiText
        });
      }

      return {
        type: "text",
        message: aiText
      };
    } catch (error) {
      logger.error("Groq API error", {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        type: "text",
        message: "Something went wrong. Please try again later."
      };
    }
  }
};
