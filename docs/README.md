# Ollama Multi-Proxy Setup

This repository contains a Docker setup for running Ollama models with proxies. You can run Gemma 4B, 12B, and 27B models separately or together.

## Quick Start Guide for Gemma 4B Only

If you're new to Docker and want to start with just the 4B model setup, follow these steps:

### Prerequisites
- Docker and Docker Compose installed
- Git repository with your proxy code

### Step-by-Step Instructions

1. **Create an environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file to set your API key**
   ```bash
   # Open with your preferred editor
   nano .env
   
   # Add or edit this line
   API_KEY_4B=YOUR_DESIRED_API_KEY
   ```

3. **Start the 4B container**
   ```bash
   docker-compose -f docker-compose-only-4b.yml up -d
   ```

4. **Verify the containers are running**
   ```bash
   docker ps
   ```
   You should see two containers: one for Ollama and one for the proxy.

5. **Test the proxy**
   ```bash
   curl -X GET http://localhost:30001/health -H "Authorization: Bearer YOUR_API_KEY_4B"
   ```
   If everything works, you should receive a response like `{"status":"ok"}`.

6. **Pull the Gemma 4B model**
   ```bash
   curl -X POST http://localhost:30001/api/pull \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY_4B" \
     -d '{"name": "gemma3:4b"}'
   ```

7. **Send a chat request**
   ```bash
   curl -X POST http://localhost:30001/api/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY_4B" \
     -d '{
       "model": "gemma3:4b",
       "messages": [
         {"role": "user", "content": "What is AI?"}
       ]
     }'
   ```

## Full Setup for All Models

To run all models (4B, 12B, and 27B), use the main docker-compose file:

```bash
# Create and edit .env file with all API keys
cp .env.example .env
nano .env

# Add these lines
API_KEY_4B=YOUR_4B_API_KEY
API_KEY_12B=YOUR_12B_API_KEY
API_KEY_27B=YOUR_27B_API_KEY

# Start all containers
docker-compose up -d
```

## Useful Commands

- **View logs**
  ```bash
  # For 4B setup only
  docker-compose -f docker-compose-only-4b.yml logs -f
  
  # For specific containers in full setup
  docker-compose logs -f gemma3_4b_proxy
  docker-compose logs -f gemma3_4b_ollama
  ```

- **Stop containers**
  ```bash
  # For 4B setup only
  docker-compose -f docker-compose-only-4b.yml down
  
  # For full setup
  docker-compose down
  ```

- **Rebuild after changes**
  ```bash
  # For 4B setup only
  docker-compose -f docker-compose-only-4b.yml up -d --build
  
  # For full setup
  docker-compose up -d --build
  ```

## Port Mappings

- Gemma 4B: `http://localhost:30001`
- Gemma 12B: `http://localhost:30002`
- Gemma 27B: `http://localhost:30003`

## API Endpoints

- Health check: `GET /health`
- Pull model: `POST /api/pull`
- Chat: `POST /api/chat`
- All other Ollama API endpoints are available through the proxy

## File Structure

```
ollama-proxy/
├── src/
│   └── index.ts
├── Dockerfile
├── docker-compose.yml
├── docker-compose-only-4b.yml
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```