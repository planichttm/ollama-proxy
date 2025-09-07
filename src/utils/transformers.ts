import { 
  OpenAIChatRequest, 
  OpenAIChatResponse, 
  OpenAIChatStreamChunk,
  OpenAIModel,
  OpenAIModelsResponse
} from '../types/openai.js';
import { 
  OllamaChatRequest, 
  OllamaChatResponse, 
  OllamaChatStreamChunk,
  OllamaModel,
  OllamaModelsResponse
} from '../types/ollama.js';
import { randomUUID } from 'crypto';

export function transformOpenAIToOllama(openaiRequest: OpenAIChatRequest): OllamaChatRequest {
  const ollamaRequest: OllamaChatRequest = {
    model: openaiRequest.model,
    messages: openaiRequest.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    stream: openaiRequest.stream ?? false
  };

  if (openaiRequest.temperature !== undefined || 
      openaiRequest.top_p !== undefined || 
      openaiRequest.max_tokens !== undefined) {
    ollamaRequest.options = {};
    
    if (openaiRequest.temperature !== undefined) {
      ollamaRequest.options.temperature = openaiRequest.temperature;
    }
    if (openaiRequest.top_p !== undefined) {
      ollamaRequest.options.top_p = openaiRequest.top_p;
    }
    if (openaiRequest.max_tokens !== undefined) {
      ollamaRequest.options.num_predict = openaiRequest.max_tokens;
    }
  }

  return ollamaRequest;
}

export function transformOllamaToOpenAI(
  ollamaResponse: OllamaChatResponse, 
  requestId: string,
  model: string
): OpenAIChatResponse {
  const created = Math.floor(new Date(ollamaResponse.created_at).getTime() / 1000);
  
  return {
    id: requestId,
    object: 'chat.completion',
    created,
    model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: ollamaResponse.message.content
      },
      finish_reason: ollamaResponse.done ? 'stop' : null
    }],
    usage: {
      prompt_tokens: ollamaResponse.prompt_eval_count ?? 0,
      completion_tokens: ollamaResponse.eval_count ?? 0,
      total_tokens: (ollamaResponse.prompt_eval_count ?? 0) + (ollamaResponse.eval_count ?? 0)
    }
  };
}

export function transformOllamaStreamToOpenAI(
  ollamaChunk: OllamaChatStreamChunk,
  requestId: string,
  model: string,
  isFirst: boolean = false
): OpenAIChatStreamChunk {
  const created = Math.floor(new Date(ollamaChunk.created_at).getTime() / 1000);
  
  return {
    id: requestId,
    object: 'chat.completion.chunk',
    created,
    model,
    choices: [{
      index: 0,
      delta: isFirst ? {
        role: 'assistant',
        content: ollamaChunk.message.content
      } : {
        content: ollamaChunk.message.content
      },
      finish_reason: ollamaChunk.done ? 'stop' : null
    }]
  };
}

export function transformOllamaModelsToOpenAI(ollamaModels: OllamaModelsResponse): OpenAIModelsResponse {
  return {
    object: 'list',
    data: ollamaModels.models.map((model: OllamaModel): OpenAIModel => ({
      id: model.name,
      object: 'model',
      created: Math.floor(new Date(model.modified_at).getTime() / 1000),
      owned_by: 'ollama'
    }))
  };
}

export function generateRequestId(): string {
  return `chatcmpl-${randomUUID().replace(/-/g, '').substring(0, 29)}`;
}