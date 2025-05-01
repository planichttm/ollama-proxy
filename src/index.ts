// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

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

// Forward all API requests to Ollama
app.post('/api/*', authenticate, async (req: Request, res: Response) => {
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
      body: JSON.stringify(req.body),
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