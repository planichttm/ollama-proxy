gpu_layers (value: 0): Specifies how many layers of the neural network model should run on the GPU. Setting this to 0 means the model will run entirely on CPU, which is appropriate when no GPU is available as shown in your logs.

num_ctx (value: 4096): Sets the context length or "window size" that the model can consider. This is the maximum number of tokens (roughly words) that the model can process at once, including both the prompt and the generated response. Higher values allow for longer conversations but consume more memory.

num_batch (value: 128): Controls how many prompt tokens are processed in a single batch. Lower values use less memory but might be slower, while higher values can improve performance at the cost of more memory usage. For CPU-only operation, 128 is a reasonable balance.

num_thread (value: 8): Determines how many CPU threads the model will use for computation. More threads can improve performance on multi-core systems, but setting this too high can cause system instability. The value should generally match the number of physical CPU cores available.

num_keep (value: 8): Specifies how many tokens from the beginning of the conversation to preserve when the context window fills up. This is important for maintaining continuity in longer conversations.

mlock (value: true): When set to true, this prevents the model from being swapped to disk, keeping it in RAM. This improves performance but requires enough physical memory to hold the entire model.