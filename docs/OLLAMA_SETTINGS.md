# Ollama Configuration Guide

## Overview

This guide covers the configuration parameters for Ollama models and how they affect performance and behavior in the Docker setup.

## Configuration Parameters

The following parameters control model behavior and performance:

### Core Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `gpu_layers` | -1 | Number of layers to run on GPU. `-1` uses all layers on GPU, `0` uses CPU only |
| `num_ctx` | 16384 | Context window size (max tokens for input + output) |
| `num_batch` | 512 | Tokens processed per batch. Higher values improve performance but use more memory |
| `num_thread` | 8 | CPU threads for computation. Should match physical CPU cores |
| `num_keep` | 8 | Tokens to preserve from conversation start when context fills |
| `num_predict` | 8192 | Maximum tokens to generate in response |
| `mlock` | false | Keep model in RAM (prevents swapping to disk) |
| `mmap` | true | Memory-map model files for efficient loading |
| `f16` | true | Use 16-bit floating point for better GPU performance |

## Configuration Methods & Precedence

Ollama supports multiple configuration methods with clear precedence:

### 1. API Parameters (Highest Priority)
Parameters passed directly in API requests override all other settings:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key" \\
  -d '{
    "model": "llama3",
    "messages": [...],
    "options": {
      "num_ctx": 4096,
      "temperature": 0.7
    }
  }'
```

### 2. Environment Variables (Medium Priority)
Set in `docker-compose.yml` with `OLLAMA_` prefix:

```yaml
environment:
  - OLLAMA_NUM_CTX=16384
  - OLLAMA_NUM_BATCH=512
  - OLLAMA_NUM_THREAD=8
  - OLLAMA_KEEP_ALIVE=60m
```

### 3. ollama.json Configuration (Lowest Priority)
Default settings in `/root/.ollama/ollama.json`:

```json
{
  "gpu_layers": -1,
  "num_ctx": 16384,
  "num_batch": 512,
  "num_thread": 8,
  "num_keep": 8,
  "mlock": false,
  "num_predict": 8192,
  "mmap": true,
  "f16": true
}
```

## Performance Optimization

### GPU Configuration
For optimal GPU performance:

```yaml
# In docker-compose.yml
deploy:
  resources:
    limits:
      memory: 36G
    reservations:
      memory: 16G
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### Memory Management
- **Shared Memory**: Set to 4GB for large models
- **Memory Lock**: Unlimited for optimal performance
- **OOM Killer**: Disabled to prevent container kills

```yaml
shm_size: 4gb
oom_kill_disable: true
ulimits:
  memlock: -1
```

### Model-Specific Recommendations

| Model Size | num_batch | num_parallel | Memory Limit | Notes |
|------------|-----------|--------------|--------------|-------|
| 7B-13B | 512 | 2 | 16G | Good balance of speed/memory |
| 13B-30B | 256 | 1 | 24G | Large models need more memory |
| 30B+ | 128 | 1 | 36G+ | Maximum memory allocation |

## Environment Variables Reference

### Core Ollama Settings
```bash
OLLAMA_DEBUG=1              # Enable debug logging
OLLAMA_VERBOSE=1            # Verbose output
OLLAMA_HOST=0.0.0.0:11434  # Bind address and port
OLLAMA_KEEP_ALIVE=60m      # Keep model in memory duration
OLLAMA_NUM_PARALLEL=1      # Concurrent requests
```

### Performance Tuning
```bash
OLLAMA_NUM_CTX=16384       # Context window size
OLLAMA_NUM_BATCH=512       # Batch size
OLLAMA_NUM_THREAD=8        # CPU threads
OLLAMA_MLOCK=false         # Memory locking
```

### GPU Settings
```bash
OLLAMA_GPU_LAYERS=-1       # All layers on GPU
OLLAMA_MAX_LOADED_MODELS=1 # Models to keep loaded
```

## Troubleshooting Performance Issues

### Memory Issues
- **Out of Memory**: Reduce `num_batch`, `num_ctx`, or use CPU-only
- **Slow Loading**: Enable `mlock=true` if you have enough RAM
- **Swapping**: Increase Docker memory limits

### GPU Issues
- **No GPU Acceleration**: Check `nvidia-docker2` installation
- **Partial GPU**: Reduce `gpu_layers` or model size
- **Memory Errors**: Reduce batch size or context window

### Performance Tuning
```bash
# Monitor GPU usage
docker exec ollama-proxy-ollama-1 nvidia-smi

# Check memory usage
docker stats ollama-proxy-ollama-1

# View Ollama logs
docker logs ollama-proxy-ollama-1 -f
```

## Advanced Configuration

### Custom Model Parameters
Create model-specific configurations:

```bash
# Inside Ollama container
ollama create custom-llama3 --file Modelfile
```

Example Modelfile:
```dockerfile
FROM llama3
PARAMETER num_ctx 32768
PARAMETER temperature 0.8
PARAMETER top_p 0.9
```

### Multiple Model Support
Configure different settings for different models using the API:

```javascript
const models = {
  'llama3': { num_ctx: 16384, temperature: 0.7 },
  'codellama': { num_ctx: 32768, temperature: 0.1 }
};
```

## Monitoring and Metrics

### Health Checks
The proxy provides health endpoints:
- `/health` - Basic health status
- `/v1/models` - Available models

### Performance Monitoring
Monitor these metrics:
- Response time
- Token throughput
- Memory usage
- GPU utilization

For production deployments, consider integrating with monitoring tools like Prometheus or Grafana.