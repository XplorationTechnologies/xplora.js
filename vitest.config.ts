import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/**/src/**/*.ts"],
      exclude: ["packages/**/tests/**", "packages/**/dist/**"],
    },
  },
});
