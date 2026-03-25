export interface MessageProcessorService {
  generateReply: (incomingText: string) => string;
}

const normalize = (text: string): string => text.toLowerCase().trim();

export const messageProcessorService: MessageProcessorService = {
  generateReply: (incomingText: string): string => {
    const text = normalize(incomingText);

    if (text.includes("price") || text.includes("cost")) {
      return "Our plans start from $19/month. Tell me your requirement and I can share the best option.";
    }

    if (text.includes("hi") || text.includes("hello")) {
      return "Hi! 👋 Welcome. How can I help you today?";
    }

    return "Thanks for your message. Please share more details so I can assist you better.";
  }
};
