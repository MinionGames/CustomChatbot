import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  plugins: [tailwindcss(), react(), cssInjectedByJsPlugin()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        intro: "var process = globalThis.process || { env: {} }; globalThis.process = process; process.env = process.env || {}; process.env.NODE_ENV = process.env.NODE_ENV || 'production';"
      }
    },
    lib: {
      entry: resolve(__dirname, 'chatbot.js'),
      name: 'CustomChatbotEmbed',
      formats: ['iife'],
      fileName: () => 'chatbot.js'
    }
  }
});
