# Ollama API Proxy

A simple proxy server for Ollama API requests with authentication.

## Features

- Authentication via API key
- Forwarding requests to the Ollama server
- Configuration via environment variables
- Docker and Docker Compose support
- Health check endpoint

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ollama installed and running (on port 11434)

### Installation

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Adjust API key and other environment variables in the `.env` file

### Starting the Proxy Server

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Docker Deployment

### Single Container

1. Configure `.env` file
2. Build Docker image:
   ```bash
   docker build -t ollama-proxy:latest .
   ```
3. Start container:
   ```bash
   docker run -p 3000:3000 --env-file .env ollama-proxy:latest
   ```

### With Docker Compose

1. Set API key:
   ```bash
   export API_KEY=your_api_key_here
   ```
2. Start Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Usage

The proxy accepts requests in an OpenAI-like format and forwards them to the Ollama server:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key_here" \
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

## Cloudflare Tunnel Setup

To make the proxy accessible via Cloudflare Tunnel:

1. Install Cloudflare Tunnel on the workstation
2. Create a new tunnel
3. Configure tunnel with the proxy endpoint (e.g., `localhost:3000`)
4. Set up DNS entry to point to the tunnel

## Multiple Docker Containers

For multiple instances:

1. Create separate Docker Compose configurations for each instance
2. Use different ports and API keys for each instance
3. Adjust Cloudflare Tunnel rules to point to the different ports

## Health Check

The proxy provides a health check endpoint at `/health`