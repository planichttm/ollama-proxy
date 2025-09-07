# Ollama API Proxy

A simple proxy server for Ollama API requests with authentication, designed to provide OpenAI-compatible endpoints for Ollama models.

## Features

- **OpenAI API Compatibility**: Accept requests in OpenAI format and forward them to Ollama
- **Authentication**: API key-based authentication for secure access
- **Docker Support**: Complete containerized setup with Docker Compose
- **Cloudflare Tunnel Integration**: Built-in support for secure external access
- **Health Check Endpoint**: Monitor proxy status
- **GPU Acceleration**: NVIDIA GPU support for Ollama container
- **Flexible Configuration**: Environment-based configuration

## Quick Start

### Prerequisites

- Docker and Docker Compose
- NVIDIA Docker runtime (for GPU support)
- Node.js 18+ (for local development)

### Docker Deployment (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/planichttm/ollama-proxy.git
   cd ollama-proxy
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API key and configuration
   ```

3. **Start the services:**
   ```bash
   npm run start:ollama
   # or directly: docker-compose up -d
   ```

4. **Download models** (in Ollama container):
   ```bash
   docker exec -it ollama-proxy-ollama-1 /bin/bash
   ollama pull llama3
   ollama pull codellama
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (change OLLAMA_URL to http://localhost:11434)
   ```

3. **Start Ollama locally** (port 11434)

4. **Start the proxy:**
   ```bash
   npm run dev          # Development mode
   # or
   npm run build && npm start  # Production mode
   ```

## Usage

The proxy accepts OpenAI-compatible requests. **All models use the same endpoint** - specify which model to use via the `model` parameter:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Available Endpoints

- `POST /v1/chat/completions` - Chat completions (OpenAI compatible)
- `GET /v1/models` - List available models
- `GET /health` - Health check

## Cloudflare Tunnel Setup

For secure external access:

1. **Set up Cloudflare Tunnel:**
   ```bash
   # Install cloudflared and create a tunnel
   cloudflared tunnel create ollama-proxy
   ```

2. **Configure tunnel:**
   ```bash
   cp cloudflare/config.example.yml cloudflare/config.yml
   # Edit config.yml with your tunnel ID and domain
   ```

3. **Add tunnel credentials:**
   Place your tunnel credentials JSON file in `cloudflare/`

4. **The tunnel will automatically start with Docker Compose**

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_KEY` | Required | Authentication key for API access |
| `OLLAMA_URL` | `http://ollama:11434` (Docker)<br>`http://localhost:11434` (local) | Ollama server URL |
| `PORT` | `3000` | Proxy server port (local dev only) |

### Docker Configuration

The Docker setup includes:
- **Ollama container**: Runs Ollama with GPU support
- **Proxy container**: Runs the API proxy
- **Cloudflared container**: Provides tunnel access (optional)

### GPU Configuration

The setup supports NVIDIA GPUs with:
- 36GB memory limit
- 16GB memory reservation
- Single GPU allocation
- Unlimited locked memory

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run start:ollama` | Start Docker Compose setup |
| `npm run stop:ollama` | Stop Docker Compose setup |
| `npm run logs:ollama` | View Docker Compose logs |
| `npm run restart:ollama` | Restart Docker Compose setup |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |

## Project Structure

```
ollama-proxy/
├── src/                          # Source code
├── ollama/                       # Ollama configuration
│   └── ollama.json              # Model settings
├── cloudflare/                   # Cloudflare tunnel config
│   ├── config.yml               # Tunnel config (ignored)
│   ├── config.example.yml       # Tunnel template
│   └── *.json                   # Credentials (ignored)
├── docker-compose.yml           # Main Docker setup
├── docker-compose.example.yml   # Example configuration
├── .env.example                 # Environment template
└── docs/                        # Documentation
```

## Security Notes

- Keep your API key secure and never commit it to version control
- Cloudflare tunnel credentials are sensitive and excluded from git
- The proxy only accepts requests with valid API keys
- Internal communication uses Docker networks for security

## Troubleshooting

### Port Conflicts
If you encounter port conflicts, the setup uses internal Docker networking without host port mapping for security.

### GPU Access
Ensure NVIDIA Docker runtime is installed:
```bash
# Install nvidia-docker2
sudo apt-get install nvidia-docker2
sudo systemctl restart docker
```

### Model Downloads
Access the Ollama container to manage models:
```bash
docker exec -it ollama-proxy-ollama-1 /bin/bash
ollama list                    # List installed models
ollama pull <model-name>       # Download models
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For questions or support, please open an issue on GitHub.