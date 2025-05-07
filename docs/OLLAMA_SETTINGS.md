# Scribomate Gemma3 4B/12B/27B

## Ollama Model Configuration

The following parameters influence the behavior and performance of the Gemma3 model in Ollama:

### Basic Parameters

| Parameter | Value | Description |
|-----------|------|--------------|
| `gpu_layers` | -1 | Determines how many layers of the model run on the GPU. The value `-1` means all layers run on the GPU. A value of `0` would mean the model runs entirely on CPU. |
| `num_ctx` | 4096 | Sets the context length or "window size" that the model can consider. This value represents the maximum number of tokens the model can process simultaneously, including both the prompt and the generated response. Higher values allow for longer conversations but require more memory. |
| `num_batch` | 64 | Controls how many prompt tokens are processed in a single batch. Lower values use less memory but might be slower, while higher values can improve performance at the cost of more memory usage. |
| `num_thread` | 8 | Determines how many CPU threads the model will use for computation. More threads can improve performance on multi-core systems, but setting this too high can cause system instability. The value should generally match the number of physical CPU cores available. |
| `num_keep` | 8 | Specifies how many tokens from the beginning of the conversation to preserve when the context window fills up. This is important for maintaining continuity in longer conversations. |
| `num_predict` | 4096 | Defines the maximum number of tokens the model will generate. This is a limit only for the output in tokens and has no influence on the input. Serves as a "safety net" to prevent endless generations. |
| `mlock` | false | When set to `true`, this prevents the model from being swapped to disk, keeping it in RAM. This improves performance but requires enough physical memory to hold the entire model. |

### Configuration Methods and Precedence

Ollama supports three different methods to configure the above parameters, with a clear precedence order:

1. **API Parameters (Highest Priority)**: Parameters passed directly in API calls like `/api/generate` or `/api/chat` have the highest precedence and will override all other settings.

2. **Environment Variables (Middle Priority)**: Environment variables set in the Docker container (in docker-compose.yml) with the `OLLAMA_` prefix take precedence over the configuration file. For example:
   - `OLLAMA_NUM_CTX`
   - `OLLAMA_NUM_BATCH`
   - `OLLAMA_NUM_THREAD`

3. **ollama.json (Lowest Priority)**: The configuration file mounted to `/root/.ollama/ollama.json` contains default values and will only be used if no corresponding environment variables or API parameters are set. Parameters here do not use the `OLLAMA_` prefix:
   - `num_ctx`
   - `num_batch`
   - `num_thread`

### Model Size-Specific Recommendations

For optimal performance with different model sizes, consider these recommended configurations:

| Parameter | 4B Model | 12B Model | 27B Model |
|-----------|---------|----------|----------|
| `num_batch` | 128 | 64 | 32 |
| `num_thread` | 8 | 8 | 8 |
| `gpu_layers` | 0 (CPU) or -1 (GPU) | -1 (GPU) | -1 (GPU) |
| `OLLAMA_NUM_PARALLEL` | 4 | 2 | 1 |

#### Handling Multiple Instances and Parallel Requests

- **OLLAMA_NUM_PARALLEL**: Controls how many concurrent requests a model can process:
  - Setting this to 1 will queue additional requests when the model is busy
  - Higher values allow multiple simultaneous inference processes but increase memory usage
  - Memory usage doesn't double with each parallel request as model weights are shared, but KV cache and computation buffers are not

- **OLLAMA_MAX_QUEUE** (default: 512): Determines how many requests can be queued when all parallel slots are busy. Requests beyond this limit receive a 503 error.

### Detailed Explanation of Context Window (num_ctx) and Prediction Limit (num_predict)

#### Tokens vs. Characters

LLMs like Gemma3 work with tokens, not characters:
- A **token** corresponds to approximately 4-5 characters or about 0.75 words in English
- Tokenization varies depending on the model

#### Relationship between num_ctx and num_predict

The parameters are related as follows:

1. **Input + Output ≤ num_ctx**: The sum of input tokens and output tokens must not exceed `num_ctx`
2. **Output ≤ num_predict**: The number of output tokens is limited by `num_predict`
3. **num_predict ≤ num_ctx**: The maximum response length cannot be greater than the context window

#### Example Calculation

Suppose a prompt has the following sizes:
- System prompt: ~200 tokens
- Formatted user message: ~800 tokens
- Total: ~1000 tokens input

With the current settings:
- `num_ctx = 4096`: Total context of 4096 tokens
- `num_predict = 4096`: Maximum 4096 tokens output

In this case, theoretically up to 3096 tokens (4096 - 1000) could be generated as a response, limited by the `num_predict` limit of 4096 tokens.

### Multi-Instance CPU Thread Allocation

When running multiple Ollama instances on the same CPU:

- Threads are shared by default and instances will compete for CPU resources
- For optimal performance, you should explicitly allocate CPU threads to each instance
- For a CPU like the Ryzen 9 9950X with 32 threads, you could allocate:
  - 4B model: Threads 0-7 (8 threads)
  - 12B model: Threads 8-19 (12 threads)
  - 27B model: Threads 20-31 (12 threads)

This can be implemented in docker-compose.yml using the `cpuset` parameter:

```yaml
# For 4B model
gemma3_4b_ollama:
  # Other settings...
  cpuset: "0-7"

# For 12B model
gemma3_12b_ollama:
  # Other settings...
  cpuset: "8-19"

# For 27B model
gemma3_27b_ollama:
  # Other settings...
  cpuset: "20-31"
```

### Optimization Recommendations

- Increase `num_ctx` for longer conversations or complex tasks (e.g., to 6144 or 8192), if your hardware supports it
- If experiencing memory issues, reduce `num_batch` and `num_ctx`
- Ensure `num_thread` matches your CPU configuration
- Adjust `num_predict` if you need longer or shorter responses
- For larger models (27B), use a lower `num_batch` value (32) to prevent out-of-memory errors
- For smaller models (4B), a higher `num_batch` value (128) can improve processing speed





"gpu_layers": 60 oder "gpu_layers": 50: Statt alle Schichten auf die GPU zu laden (-1), laden wir nur einen Teil. Bei der q3_K_S-Variante können wir mehr Schichten auf die GPU laden (60), bei der größeren q4_0-Variante etwas weniger (50). Die restlichen Schichten werden im RAM verarbeitet.
"num_ctx": 8192: Eine Reduzierung des Kontextfensters von 32768 auf 8192 spart erheblich Speicher, sowohl VRAM als auch RAM. Du kannst diesen Wert erhöhen, wenn du längere Texte verarbeiten musst und genug Speicher hast.
"num_batch": 512: Erhöht von 64 auf 512 für bessere Verarbeitungseffizienz bei Batch-Anfragen.
"mmap": true: Aktiviert Memory-Mapped Files, was die Speicherverwaltung verbessert, besonders bei großen Modellen.
"f16": true: Verwendet Halbe Präzision (float16) für die Berechnungen, was die Speichernutzung weiter reduziert und die Geschwindigkeit erhöht.