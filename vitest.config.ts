import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Next.js resolves the `server-only` marker module through its own
      // compiler alias; mirror it here so server modules are importable in tests.
      "server-only": "next/dist/compiled/server-only/empty",
    },
  },
});
