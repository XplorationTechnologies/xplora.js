import { defineConfig } from "xplorajs";

export default defineConfig({
  dev: {
    port: 3000,
    hmr: true,
  },
  static: {
    outputDir: "./dist",
    revalidate: 3600,
    fallback: false,
  },
  // Build options
  build: {
    minify: true,
    sourcemap: true,
  },
});
