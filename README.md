# Ollama API Proxy

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#docker-deployment-recommended)
[![OpenAI](https://img.shields.io/badge/OpenAI-Compatible-10A37F?style=for-the-badge&logo=openai&logoColor=white)](#openai-compatible-api)
[![Ollama](https://img.shields.io/badge/Ollama-Native-FF6B35?style=for-the-badge&logo=ollama&logoColor=white)](#native-ollama-api)
[![GPU](https://img.shields.io/badge/GPU-NVIDIA%20Ready-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](#gpu-configuration)
[![Health](https://img.shields.io/badge/Health-Check-4CAF50?style=for-the-badge&logo=heart&logoColor=white)](#general-endpoints)

A simple proxy server for Ollama API requests with authentication, designed to provide OpenAI-compatible endpoints for Ollama models.

<details>
<summary>📋 Table of Contents</summary>

- [✨ Features](#features)
- [🚀 Quick Start](#quick-start)
- [🔌 API Usage](#api-usage)
- [☁️ Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
- [⚙️ Configuration](#configuration)
- [📂 Project Structure](#project-structure)
- [🔒 Security Notes](#security-notes)
- [🔧 Troubleshooting](#troubleshooting)
- [📄 License](#license)
- [🤝 Contributing](#contributing)

</details>

## ✨ Features

- **OpenAI API Compatibility**: Accept requests in OpenAI format and forward them to Ollama
- **Authentication**: API key-based authentication for secure access
- **Docker Support**: Complete containerized setup with Docker Compose
- **Cloudflare Tunnel Integration**: Built-in support for secure external access
- **Health Check Endpoint**: Monitor proxy status
- **GPU Acceleration**: NVIDIA GPU support for Ollama container
- **Flexible Configuration**: Environment-based configuration

## 🚀 Quick Start

<details>
<summary>📋 Prerequisites</summary>

- Docker and Docker Compose
- NVIDIA Docker runtime (for GPU support)
- Node.js 18+ (for local development)

</details>

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/loonylabs-dev/ollama-proxy.git
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

<details>
<summary>💻 Local Development</summary>

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

</details>

## 🔌 API Usage

The proxy supports both native Ollama API and OpenAI-compatible endpoints. Choose the API that best fits your use case:

### Native Ollama API

Use these endpoints for direct Ollama compatibility or tools that support Ollama natively:

**Available Endpoints:**
- `POST /api/chat` - Chat with streaming support
- `POST /api/generate` - Text generation  
- `GET /api/tags` - List installed models

**Example - Chat:**
```bash
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

**Example - List Models:**
```bash
curl -X GET http://localhost:3000/api/tags \\
  -H "Authorization: Bearer your_api_key_here"
```

### OpenAI-Compatible API

Use these endpoints for OpenAI tools (LobeChat, ChatGPT-Web, OpenAI Python library, etc.):

**Available Endpoints:**
- `POST /v1/chat/completions` - Chat completions (OpenAI format)
- `GET /v1/models` - List models (OpenAI format)

**Example - Chat:**
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

**Tool Configuration:**
Most OpenAI tools require the base URL to end with `/v1`:

```
✅ Correct: http://your-domain.com/v1
❌ Wrong: http://your-domain.com
```

**Popular Tools:**
- **LobeChat:** Base URL: `http://your-domain.com/v1`
- **OpenAI Python:** `base_url="http://your-domain.com/v1"`
- **ChatGPT-Web:** API Endpoint: `http://your-domain.com/v1`

### General Endpoints

- `GET /health` - Health check (no authentication required)

## ☁️ Cloudflare Tunnel Setup

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

## ⚙️ Configuration

<details>
<summary>🔧 Environment Variables</summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `API_KEY` | Required | Authentication key for API access |
| `OLLAMA_URL` | `http://ollama:11434` (Docker)<br>`http://localhost:11434` (local) | Ollama server URL |
| `PORT` | `3000` | Proxy server port (local dev only) |

</details>

<details>
<summary>🐳 Docker Configuration</summary>

The Docker setup includes:
- **Ollama container**: Runs Ollama with GPU support
- **Proxy container**: Runs the API proxy
- **Cloudflared container**: Provides tunnel access (optional)

</details>

<details>
<summary>🎮 GPU Configuration</summary>

The setup supports NVIDIA GPUs with:
- 36GB memory limit
- 16GB memory reservation
- Single GPU allocation
- Unlimited locked memory

</details>

<details>
<summary>📜 NPM Scripts</summary>

| Script | Description |
|--------|-------------|
| `npm run start:ollama` | Start Docker Compose setup |
| `npm run stop:ollama` | Stop Docker Compose setup |
| `npm run logs:ollama` | View Docker Compose logs |
| `npm run restart:ollama` | Restart Docker Compose setup |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |

</details>

## 📂 Project Structure

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

## 🔒 Security Notes

- Keep your API key secure and never commit it to version control
- Cloudflare tunnel credentials are sensitive and excluded from git
- The proxy only accepts requests with valid API keys
- Internal communication uses Docker networks for security

## 🔧 Troubleshooting

### API Connection Issues

**OpenAI Tools (404 errors):**
- **Problem:** "Cannot POST /chat/completions" or 404 errors
- **Solution:** Use `/v1` in base URL: `http://your-domain.com/v1`
- **Why:** OpenAI tools append `/chat/completions` automatically

**Native Ollama Tools:**
- **Problem:** Connection refused or 404 on `/api/*` endpoints
- **Solution:** Use base URL without `/v1`: `http://your-domain.com`
- **Endpoints:** `/api/chat`, `/api/tags`, `/api/generate`

### Model Issues

**Model Not Found:**
- **Symptoms:** Chat fails but models list works
- **Check available models:**
  - OpenAI format: `GET /v1/models`
  - Ollama format: `GET /api/tags`
- **Solution:** Download missing models in Ollama container

**Download Models:**
```bash
docker exec -it ollama-proxy-ollama-1 /bin/bash
ollama list                    # List installed models
ollama pull llama3            # Download new models
ollama pull qwen2.5:7b        # Download specific version
```

### Authentication Issues

**401 Unauthorized:**
- Check `API_KEY` in `.env` file
- Ensure `Authorization: Bearer your_api_key` header is correct
- Health endpoint (`/health`) doesn't require authentication

### Performance Issues

**Request Too Large:**
- Proxy accepts up to 10MB request bodies
- Consider reducing conversation history for long chats

**GPU Not Used:**
- **Verify GPU configuration** in `docker-compose.yml`:
  - Must have both `runtime: nvidia` AND `deploy.resources.reservations.devices`
  - See [GPU Configuration Best Practices](#gpu-initialization-issues) below
- **Check NVIDIA Docker runtime:** `sudo apt install nvidia-docker2`
- **Test GPU access in container:** `docker exec ollama-proxy-ollama-1 nvidia-smi`
- **Check Ollama logs:** `npm run logs:ollama`
- **Look for:** "insufficient VRAM" or "offloaded 0/X layers" indicates GPU fallback

### GPU Initialization Issues

**Problem:** GPU detected by system but not by Ollama container
- **Symptoms:**
  - `ggml_cuda_init: failed to initialize CUDA: no CUDA-capable device is detected`
  - `cuda driver library failed to get device context 800/801`
  - `Failed to initialize NVML: Unknown Error`
  - `nvidia-smi` works on host but fails in container

**Solution:** Configure nvidia-container-runtime cgroups support
```bash
# Enable cgroups in nvidia-container-runtime
sudo sed -i 's/#no-cgroups = false/no-cgroups = false/' /etc/nvidia-container-runtime/config.toml

# Restart Docker to apply changes
sudo systemctl restart docker

# Recreate containers
docker-compose down && docker-compose up -d
```

**GPU Configuration Best Practices:** Use both mechanisms for maximum compatibility
```yaml
# ✅ Recommended: Use BOTH for reliable GPU access
ollama:
  runtime: nvidia  # Direct GPU access (required!)
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]

# ❌ Common mistake: Using only deploy without runtime
# This configuration may fail to initialize GPU in container
deploy:
  resources:
    reservations:
      devices: [...]
# Missing: runtime: nvidia
```

**Why both mechanisms?**
- `runtime: nvidia` ensures GPU driver access in container (nvidia-smi works)
- `deploy.resources` provides resource limits and allocation
- Using only `deploy` without `runtime` can lead to NVML initialization failures

**NVIDIA Driver Compatibility:**
- **Known issues:** Driver series 555.x had Ollama compatibility problems
- **Recommended:** Use stable drivers (545.x, 552.x series)
- **RTX 5090:** Driver 575.64+ generally works but may show performance warnings

### GPU Watchdog for Production Stability

**Problem:** Ollama occasionally falls back to CPU after model switching due to VRAM not being released properly. This is a [known issue](https://github.com/ollama/ollama/issues/9016) affecting production deployments.

**Solution:** The setup includes an automatic GPU watchdog container that monitors and restarts Ollama when GPU issues occur:

```bash
# Watchdog starts automatically with the full stack
docker-compose up -d

# View watchdog logs
docker logs ollama-proxy-watchdog-1 -f

# Or view persistent logs
tail -f logs/watchdog/ollama-watchdog.log
```

**What the watchdog monitors:**
- `insufficient VRAM to load any model layers`
- `offloaded 0/X layers to GPU` (indicates CPU fallback)
- `gpu VRAM usage didn't recover within timeout`
- `runner.vram="0 B"` (GPU not allocated)

**Features:**
- **Fully automated** - no manual intervention required
- **Container-based** - runs as part of your Docker stack
- **Silent monitoring** - only logs when problems detected
- **JSON structured logs** for easy monitoring
- **Health checks** and restart policies
- **Runs as root** - required for Docker socket access
- **Configurable** via environment variables:
  - `CHECK_INTERVAL=5` (seconds between checks)
  - `RESTART_COOLDOWN=60` (minimum seconds between restarts)
  - `LOG_LEVEL=INFO` (DEBUG, INFO, WARNING, ERROR)

**Logging Behavior:**
- **INFO mode (default):** Silent during normal operation, logs only when problems detected
- **DEBUG mode:** Verbose logging including all monitored log lines (for troubleshooting only)
- Logs are written to both stdout (Docker logs) and `/var/log/watchdog/ollama-watchdog.log`

**Architecture:**
The watchdog runs as a separate container with access to Docker socket, allowing it to monitor and restart the Ollama container when GPU fallback is detected. It runs as root to access the Docker daemon. This ensures your setup remains production-ready without manual intervention.

### Docker Issues

**Port Conflicts:**
- Setup uses internal Docker networking (no host ports exposed)
- Access via Cloudflare tunnel or modify `docker-compose.yml`

**Container Won't Start:**
- Check Docker Compose logs: `docker-compose logs`
- Verify `.env` file exists and contains `API_KEY`
- Ensure NVIDIA runtime available for GPU support

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For questions or support, please open an issue on GitHub.