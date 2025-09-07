# Docker Compose Setup Guide

## Prerequisites
- Docker and Docker Compose are installed
- NVIDIA Docker runtime (for GPU support)
- Git repository with your proxy code

## Step-by-Step Setup

1. **Navigate to the project directory**
   ```bash
   cd path/to/your/ollama-proxy
   ```

2. **Set up environment configuration**
   ```bash
   # Create environment file from template
   cp .env.example .env
   
   # Edit the file and set your API key
   nano .env  # or your preferred editor
   ```

3. **Configure API key**
   ```bash
   # Set the API key environment variable
   export API_KEY=your_secret_api_key_here
   ```

4. **Start Docker containers**
   ```bash
   # Start all services
   npm run start:ollama
   # or directly: docker-compose up -d
   ```

5. **Verify containers are running**
   ```bash
   docker ps
   ```

6. **Download Ollama models**
   ```bash
   # Access Ollama container
   docker exec -it ollama-proxy-ollama-1 /bin/bash
   
   # Download models inside the container
   ollama pull llama3
   ollama pull codellama
   ollama list  # Verify downloaded models
   ```

## Important Commands

- **Start containers**: `npm run start:ollama` or `docker-compose up -d`
- **Stop containers**: `npm run stop:ollama` or `docker-compose down`
- **View logs**: `npm run logs:ollama` or `docker-compose logs -f`
- **Restart containers**: `npm run restart:ollama` or `docker-compose restart`
- **Rebuild after changes**: `docker-compose up -d --build`
- **Remove containers and volumes**: `docker-compose down -v`

## Testing the Proxy

### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### List Models
```bash
curl -X GET http://localhost:3000/v1/models \\
  -H "Authorization: Bearer your_api_key_here"
```

### Chat Request (OpenAI Compatible)
```bash
curl -X POST http://localhost:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "user", "content": "What is artificial intelligence?"}
    ]
  }'
```

## Container Architecture

The setup includes three main services:

1. **Ollama Container**: Runs the Ollama server with GPU support
2. **Proxy Container**: Provides OpenAI-compatible API endpoints
3. **Cloudflared Container**: Enables secure tunnel access (optional)

## GPU Configuration

The Ollama container is configured with:
- NVIDIA GPU support
- 36GB memory limit
- 16GB memory reservation
- 4GB shared memory
- Unlimited locked memory

## Troubleshooting

### Container Won't Start
- Check if Docker daemon is running: `docker info`
- Verify NVIDIA runtime: `docker run --rm --gpus all nvidia/cuda:11.0.3-base-ubuntu20.04 nvidia-smi`

### Port Conflicts
The current setup uses internal Docker networking without host port mapping for security. Access is through Cloudflare tunnel or internal network only.

### Model Download Issues
- Ensure the Ollama container has internet access
- Check available disk space: `docker system df`
- Monitor download progress: `docker logs ollama-proxy-ollama-1`

### GPU Not Available
- Install NVIDIA Docker: `sudo apt-get install nvidia-docker2`
- Restart Docker: `sudo systemctl restart docker`
- Verify GPU access: `docker exec -it ollama-proxy-ollama-1 nvidia-smi`