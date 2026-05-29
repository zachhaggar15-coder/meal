import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // All node_modules into one cached vendor chunk — avoids circular-ref
          // warnings from react-router v7's @remix-run internals.
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
          // All static data files into one lazy-cacheable chunk
          if (
            id.includes('/src/data/mealPlans') ||
            id.includes('/src/data/mealLibrary') ||
            id.includes('/src/data/planSeeds') ||
            id.includes('/src/data/blogPosts')
          ) {
            return 'plan-data';
          }
        },
      },
    },
  },
});
