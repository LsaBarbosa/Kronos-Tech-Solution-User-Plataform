import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === "analyze" &&
    visualizer({
      filename: "dist/bundle-stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  server: {
    host: "::",
    port: 5173, // Alterado para evitar conflito com o backend na porta 8080
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("jspdf") || id.includes("jspdf-autotable") || id.includes("html2canvas")) return "vendor-pdf";
          if (id.includes("react-hook-form") || id.includes("@hookform/resolvers") || id.includes("zod")) return "vendor-forms";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) return "vendor-react";
          return undefined;
        },
      },
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/e2e/**"],
  },
}));
