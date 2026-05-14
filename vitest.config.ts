import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/lib/stats-core/**/*.ts',
        'src/export/**/*.ts',
        'src/store/**/*.ts',
        'src/utils/**/*.ts',
        'src/engine/**/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/index.ts'],
    },
  },
});
