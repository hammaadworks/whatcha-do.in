import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'], // Exclude E2E tests
    server: { // Add server object
      deps: {
        inline: ['@supabase/supabase-js'], // Force Vitest to inline this dependency
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'), // Resolve @/ to project root
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'], // Explicitly define extensions
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  ssr: {
    noExternal: ['@supabase/supabase-js'], // Ensure Supabase is bundled for SSR/testing
  },
});
