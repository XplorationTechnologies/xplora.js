import { describe, it, expect } from "vitest";
import { defineConfig } from "../src/config";

describe("defineConfig", () => {
  it("should return default values when empty config", () => {
    const config = defineConfig({});

    expect(config.dev?.port).toBe(3000);
    expect(config.dev?.hmr).toBe(true);
    expect(config.static?.outputDir).toBe("./dist");
    expect(config.static?.revalidate).toBe(3600);
    expect(config.static?.fallback).toBe(false);
    expect(config.build?.minify).toBe(true);
    expect(config.build?.sourcemap).toBe(true);
  });

  it("should override default values with custom config", () => {
    const config = defineConfig({
      dev: { port: 4000 },
    });

    expect(config.dev?.port).toBe(4000);
    expect(config.dev?.hmr).toBe(true);
  });

  it("should preserve all custom options", () => {
    const config = defineConfig({
      dev: { port: 5000, hmr: false },
      static: { outputDir: "./out", revalidate: 60, fallback: true },
      build: { minify: false, sourcemap: false },
    });

    expect(config.dev?.port).toBe(5000);
    expect(config.dev?.hmr).toBe(false);
    expect(config.static?.outputDir).toBe("./out");
    expect(config.static?.revalidate).toBe(60);
    expect(config.static?.fallback).toBe(true);
    expect(config.build?.minify).toBe(false);
    expect(config.build?.sourcemap).toBe(false);
  });
});
