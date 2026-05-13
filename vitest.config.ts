import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
      },
    },
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "dist/",
        "coverage/",

        // bootstrap da aplicação
        "src/main.tsx",
        "src/vite-env.d.ts",

        // tipos e arquivos gerados
        "src/**/*.d.ts",
        "src/types/**",
        "src/generated/**",

        // componentes base de UI/shadcn
        "src/components/ui/**",

        // arquivos barrel
        "src/**/index.ts",

        // testes e setup
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/test/**",
      ],
      thresholds: {
        statements: 40,
        branches: 30,
        functions: 33,
        lines: 40,
      },
    },
  },
});
