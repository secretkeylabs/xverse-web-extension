/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    alias: {
      '@components': '/src/app/components',
      '@hooks': '/src/app/hooks',
      '@assets': '/src/assets',
      '@screens': '/src/app/screens',
      '@common': '/src/common',
      '@stores': '/src/app/stores',
      '@utils': '/src/app/utils',
      '@core': '/src/app/core',
      '@ui-library': '/src/app/ui-library',
      '@ui-components': '/src/app/ui-components',
    },
  },
});
