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
        // Vite 8 bundles with Rolldown, which only partially honours the legacy
        // manualChunks hint - three blog data modules (expandedBlogPosts,
        // prepKitBlogPosts, practicalGuides) silently landed in blog-data-core
        // despite having entries below, which is what pushed that chunk over
        // the 140KB budget. advancedChunks is Rolldown's own API and is
        // honoured; the groups here mirror the manualChunks list.
        advancedChunks: {
          groups: [
            { name: 'blog-data-batch-4', test: /blogPostsBatch4/ },
            { name: 'blog-data-batch-5', test: /blogPostsBatch5/ },
            { name: 'blog-data-batch-6', test: /blogPostsBatch6/ },
            { name: 'blog-data-batch-7', test: /blogPostsBatch7/ },
            { name: 'blog-data-batch-8', test: /blogPostsBatch8/ },
            { name: 'blog-data-guides', test: /practicalGuides/ },
            { name: 'blog-data-expanded', test: /expandedBlogPosts/ },
            { name: 'blog-data-containers', test: /containerBlogPosts/ },
            { name: 'blog-data-commercial', test: /commercialBlogPosts/ },
            { name: 'blog-data-prep-kit', test: /prepKitBlogPosts/ },
          ],
        },
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
            ['blogPostsBatch8', 'blog-data-batch-8'],
            ['practicalGuides', 'blog-data-guides'],
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
