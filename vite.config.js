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
          if (id.includes('/src/data/planSeeds') || id.includes('/src/data/mealLibrary')) {
            return 'generated-plan-data';
          }
          if (id.includes('/src/data/mealPlans')) {
            return 'legacy-plan-data';
          }
          if (
            id.includes('/src/data/blogPosts') ||
            id.includes('/src/data/expandedBlogPosts') ||
            id.includes('/src/data/containerBlogPosts')
          ) {
            return 'blog-data';
          }
          if (id.includes('/src/data/containerProducts') || id.includes('/src/data/offers')) {
            return 'container-data';
          }
        },
      },
    },
  },
});
