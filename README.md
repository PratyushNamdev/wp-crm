# WhatsApp AI Auto-Reply Backend (Express + TypeScript)

Production-ready Node.js backend for receiving WhatsApp Cloud API webhook events, processing incoming messages, and sending automated replies.

## Features

- Express + TypeScript backend
- WhatsApp webhook verification (`GET /webhook`)
- Incoming message handler (`POST /webhook`)
- Rule-based message processing:
  - `price` / `cost` → price response
  - `hi` / `hello` → greeting
  - fallback for all other messages
- Sends replies via Meta WhatsApp Cloud API
- Health check route (`GET /health`)
- Environment-based configuration (`dotenv`)
- Simple logger utility

## Project Structure

```bash
src/
  controllers/
  routes/
  services/
  utils/
  app.ts
  server.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values.

## Run

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production Start

```bash
npm start
```

## API Endpoints

### `GET /health`

Returns application health status.

### `GET /webhook`

Meta verification endpoint.

Expected query parameters from Meta:
- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

If verify token matches, responds with `hub.challenge`.

### `POST /webhook`

Receives WhatsApp incoming messages, extracts sender/message text, generates auto-reply, and sends response using Cloud API.

## Example `.env`

```env
PORT=3000
VERIFY_TOKEN=my_verify_token
WHATSAPP_TOKEN=EAAB...your_meta_token...
PHONE_NUMBER_ID=123456789012345
```
