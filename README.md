# WhatsApp AI Auto-Reply Backend

Minimal Node.js + Express + TypeScript backend for WhatsApp Cloud API auto-replies.

## Features

- `GET /webhook` for Meta webhook verification
- `POST /webhook` for receiving customer messages
- Basic keyword-based reply logic for greetings, price, availability, and details
- Outbound reply sending through Meta Graph API `v22.0`
- Environment-based configuration with `dotenv`
- Clear request and error logging

## Project Structure

```text
src/
  controllers/
    webhookController.ts
  routes/
    webhookRoutes.ts
  services/
    messageProcessorService.ts
    whatsappService.ts
  utils/
    env.ts
    logger.ts
  app.ts
  server.ts
```

## Environment Variables

```env
PORT=3000
VERIFY_TOKEN=your_verify_token_here
WHATSAPP_TOKEN=your_whatsapp_cloud_api_token_here
PHONE_NUMBER_ID=your_phone_number_id_here
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

## Local Run

```bash
npm run dev
```

## Ngrok

If `ngrok` is installed on your machine, start the public tunnel with:

```bash
npm run tunnel
```

This runs:

```bash
ngrok http 3000
```

After ngrok starts:

1. Copy the HTTPS forwarding URL
2. Put it into `.env` as `PUBLIC_BASE_URL`
3. Restart `npm run dev`
4. The server logs will print the exact Meta callback URL as `https://your-ngrok-url/webhook`

## Build

```bash
npm run build
```

## Endpoints

### `GET /webhook`

Used by Meta during webhook setup.

- Validates `hub.verify_token` against `VERIFY_TOKEN`
- Returns `hub.challenge` on success

Example:

```text
/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token_here&hub.challenge=123456
```

### `POST /webhook`

Receives WhatsApp webhook events, extracts incoming text messages, logs them, generates a reply, and sends the reply back via Cloud API.

Current reply behavior:

- `price`, `cost`, `rate` -> product price
- `available`, `availability` -> stock reply
- `details`, `detail`, `bhejo` -> product details
- `hi`, `hello`, `hey` -> greeting
- anything else -> fallback message

## Connect With Ngrok

1. Start the backend with `npm run dev`
2. Start ngrok with `npm run tunnel`
3. Copy the ngrok HTTPS URL into `.env` as `PUBLIC_BASE_URL`
4. Restart the backend so it logs the final public webhook URL
5. In Meta App dashboard, set the webhook callback URL to:

```text
https://your-ngrok-url/webhook
```

6. Set the verify token in Meta to match `VERIFY_TOKEN`
7. Subscribe to WhatsApp message events

## Notes

- This MVP is intentionally single-seller and uses hardcoded product data.
- Only inbound text messages are processed for auto-reply.
