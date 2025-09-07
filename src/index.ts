// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { 
  transformOpenAIToOllama, 
  transformOllamaToOpenAI, 
  transformOllamaStreamToOpenAI,
  transformOllamaModelsToOpenAI,
  generateRequestId 
} from './utils/transformers.js';
import { OpenAIChatRequest } from './types/openai.js';
import { OllamaChatResponse, OllamaChatStreamChunk, OllamaModelsResponse } from './types/ollama.js';

// ESM-specific adjustments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

// Middleware for JSON parsing
app.use(express.json());

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization'];
  if (!apiKey || auth !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Forward all API requests to Ollama (GET and POST)
const forwardToOllama = async (req: Request, res: Response) => {
  try {
    const endpoint = req.path.replace('/api', '');
    const targetUrl = `${ollamaUrl}/api${endpoint}`;
    
    console.log(`Forwarding request to: ${targetUrl}`);
    
    // Copy original headers (except Host and Authorization)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    Object.keys(req.headers).forEach(key => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'authorization') {
        const value = req.headers[key];
        if (typeof value === 'string') {
          headers[key] = value;
        }
      }
    });

    // Forward request unchanged to Ollama
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body),
    });

    // Copy all headers from the Ollama response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Return response unchanged
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error: unknown) {
    const proxyError = error instanceof Error ? error : new Error(String(error));
    console.error('Proxy error:', proxyError);
    res.status(500).json({ error: 'Internal server error', details: proxyError.message });
  }
};

// Register routes for both GET and POST /api/*
app.get('/api/*', authenticate, forwardToOllama);
app.post('/api/*', authenticate, forwardToOllama);

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', authenticate, async (req: Request, res: Response) => {
  try {
    const openaiRequest: OpenAIChatRequest = req.body;
    const ollamaRequest = transformOpenAIToOllama(openaiRequest);
    const requestId = generateRequestId();

    console.log(`OpenAI Chat request for model: ${openaiRequest.model}, stream: ${openaiRequest.stream}`);

    const targetUrl = `${ollamaUrl}/api/chat`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaRequest),
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: { 
          message: `Ollama error: ${response.statusText}`,
          type: 'api_error',
          code: response.status
        }
      });
    }

    if (openaiRequest.stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      let isFirst = true;
      let buffer = '';

      if (response.body) {
        response.body.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const ollamaChunk: OllamaChatStreamChunk = JSON.parse(line);
                const openaiChunk = transformOllamaStreamToOpenAI(
                  ollamaChunk, 
                  requestId, 
                  openaiRequest.model,
                  isFirst
                );
                
                res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`);
                isFirst = false;

                if (ollamaChunk.done) {
                  res.write('data: [DONE]\n\n');
                  res.end();
                  return;
                }
              } catch (parseError) {
                console.warn('Failed to parse Ollama streaming chunk:', parseError);
              }
            }
          }
        });

        response.body.on('end', () => {
          if (!res.headersSent) {
            res.write('data: [DONE]\n\n');
          }
          res.end();
        });

        response.body.on('error', (error: Error) => {
          console.error('Stream error:', error);
          res.end();
        });
      }
    } else {
      const ollamaResponse: OllamaChatResponse = await response.json() as OllamaChatResponse;
      const openaiResponse = transformOllamaToOpenAI(ollamaResponse, requestId, openaiRequest.model);
      res.json(openaiResponse);
    }
  } catch (error: unknown) {
    const apiError = error instanceof Error ? error : new Error(String(error));
    console.error('OpenAI Chat API error:', apiError);
    res.status(500).json({ 
      error: {
        message: 'Internal server error',
        type: 'api_error',
        code: 500
      }
    });
  }
});

// OpenAI-compatible models endpoint
app.get('/v1/models', authenticate, async (req: Request, res: Response) => {
  try {
    console.log('OpenAI Models request');

    const targetUrl = `${ollamaUrl}/api/tags`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: { 
          message: `Ollama error: ${response.statusText}`,
          type: 'api_error',
          code: response.status
        }
      });
    }

    const ollamaModels: OllamaModelsResponse = await response.json() as OllamaModelsResponse;
    const openaiModels = transformOllamaModelsToOpenAI(ollamaModels);
    res.json(openaiModels);
  } catch (error: unknown) {
    const apiError = error instanceof Error ? error : new Error(String(error));
    console.error('OpenAI Models API error:', apiError);
    res.status(500).json({ 
      error: {
        message: 'Internal server error',
        type: 'api_error',
        code: 500
      }
    });
  }
});

// Health check endpoint with authentication
app.get('/health', authenticate, (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
  console.log(`Forwarding requests to Ollama at: ${ollamaUrl}`);
});