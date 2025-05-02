
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.ELECTRON === 'true' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure sourcemaps for debugging
    sourcemap: process.env.NODE_ENV !== 'production',
    // Set target for better Electron compatibility
    target: 'chrome110', // Target modern Electron Chromium version
    // Optimize assets for Electron
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-toast'],
        },
        format: process.env.ELECTRON === 'true' ? 'cjs' : 'es',
      },
      // Explicitly mark Node modules as external for Electron
      external: ['electron', 'path', 'fs', 'os']
    },
    // Improve Electron compatibility
    emptyOutDir: true,
  },
  // Add specific optimizations for Electron builds
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['electron']
  },
  esbuild: {
    // Ensure proper target for Windows compatibility
    target: 'es2020',
    platform: process.env.ELECTRON === 'true' ? 'node' : 'browser',
  }
}));
