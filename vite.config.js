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
          const blogDataModules = [
            ['blogPostsBatch4', 'blog-data-batch-4'],
            ['blogPostsBatch5', 'blog-data-batch-5'],
            ['blogPostsBatch6', 'blog-data-batch-6'],
            ['blogPostsBatch7', 'blog-data-batch-7'],
            ['expandedBlogPosts', 'blog-data-expanded'],
            ['containerBlogPosts', 'blog-data-containers'],
            ['commercialBlogPosts', 'blog-data-commercial'],
            ['prepKitBlogPosts', 'blog-data-prep-kit'],
            ['/src/data/blogPosts.js', 'blog-data-core'],
          ];
          const blogChunk = blogDataModules.find(([moduleName]) => id.includes(moduleName));
          if (blogChunk) {
            return blogChunk[1];
          }
          if (id.includes('/src/data/containerProducts') || id.includes('/src/data/offers')) {
            return 'container-data';
          }
        },
      },
    },
  },
});
