# Ollama API Proxy Documentation

## Overview

This proxy provides OpenAI-compatible endpoints for Ollama models. **All models are accessible through a single endpoint** - you specify which model to use in your request body.

## Key Concept: Single Endpoint, Multiple Models

**Important:** Unlike some setups, this proxy uses ONE endpoint for ALL models. You don't need different ports for different models.

✅ **Correct:** One endpoint, model specified in request:
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -d '{"model": "llama3", "messages": [...]}'
```

❌ **Wrong:** Different ports for different models (this proxy doesn't work this way)

## Installation & Setup

### Prerequisites
- Docker and Docker Compose
- NVIDIA Docker runtime (for GPU support)

### Quick Start

1. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set your API_KEY
   ```

2. **Start the proxy:**
   ```bash
   npm run start:ollama
   ```

3. **Download models:**
   ```bash
   # Access Ollama container
   docker exec -it ollama-proxy-ollama-1 /bin/bash
   
   # Download any models you want
   ollama pull llama3
   ollama pull codellama
   ollama pull mistral
   
   # For embeddings support
   ollama pull nomic-embed-text:latest
   ```

## API Usage

### List Available Models
```bash
curl -X GET http://localhost:3000/v1/models \
  -H "Authorization: Bearer your-api-key"
```

### Chat with Any Model
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Switch Models in Same Request
```bash
# Use a different model by changing the "model" parameter
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "codellama",
    "messages": [
      {"role": "user", "content": "Write a Python function"}
    ]
  }'
```

### Embeddings Support
The proxy also supports embeddings through Ollama's `/api/embeddings` endpoint:

```bash
# Generate embeddings using nomic-embed-text model
curl -X POST http://localhost:3000/api/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "nomic-embed-text:latest",
    "prompt": "The quick brown fox jumps over the lazy dog"
  }'
```

## Available Models

The proxy supports any model that Ollama supports. Common models include:

**Chat Models:**
- **llama3** - General purpose conversational AI
- **codellama** - Code generation and programming assistance  
- **mistral** - Fast and efficient general purpose model
- **gemma** - Google's lightweight model family
- **phi** - Microsoft's small but capable models

**Embedding Models:**
- **nomic-embed-text** - Text embedding model for semantic search and RAG

To see which models are currently downloaded:
```bash
curl -X GET http://localhost:3000/v1/models \
  -H "Authorization: Bearer your-api-key"
```

## Configuration

### Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```

**For Docker setup**: Use `http://ollama:11434` (container name)
**For local development**: Change to `http://localhost:11434`

### Ollama Settings
Model behavior can be configured via `ollama/ollama.json`:

```json
{
  "gpu_layers": -1,
  "num_ctx": 16384,
  "num_batch": 512,
  "num_thread": 8
}
```

### Cloudflare Tunnel (Optional)
For external access, configure `cloudflare/config.yml`:

```yaml
tunnel: your-tunnel-id
credentials-file: /etc/cloudflared/your-tunnel.json
ingress:
  - hostname: your-domain.com
    service: http://proxy:3000
  - service: http_status:404
```

## Troubleshooting

### Model Not Found
If you get a "model not found" error:
1. Check available models: `docker exec -it ollama-proxy-ollama-1 ollama list`
2. Download the model: `docker exec -it ollama-proxy-ollama-1 ollama pull model-name`

### Performance Issues
- Increase GPU memory in docker-compose.yml
- Adjust `num_batch` in ollama.json for your hardware
- Monitor with: `docker stats ollama-proxy-ollama-1`

## Integration Examples

### Python with OpenAI Library
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="llama3",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    model: 'llama3',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

## Health Check

Monitor proxy health:
```bash
curl -X GET http://localhost:3000/health
```

Returns: `{"status":"ok"}` if healthy.