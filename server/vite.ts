import { createServer as createViteServer } from 'vite';
import type { Express } from 'express';

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: process.cwd() + '/client/src',
  });
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  // Add your static serving logic here, e.g.:
  app.use(require('express').static(process.cwd() + '/dist'));
}

export function log(message: string) {
  console.log(message);
}