import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path'; // <-- NEW

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'electron/index.js',
          dest: '',  // copy into root of /dist
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- NEW
    },
  },
  build: {
    outDir: 'dist',
  },
});
