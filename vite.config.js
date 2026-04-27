import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // When running `npm run dev`, proxy /api/* calls to a local server.
    // For full local testing of the serverless function, use `vercel dev` instead.
    port: 5173
  }
});
