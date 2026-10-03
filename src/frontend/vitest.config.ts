import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Pin the worker bounds explicitly: the host environment can export
    // VITEST_MIN_THREADS/VITEST_MAX_THREADS that conflict and crash Tinypool
    // before any test file is collected.
    minWorkers: 1,
    maxWorkers: 1,
  },
});
