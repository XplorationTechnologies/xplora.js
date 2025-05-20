interface XploraConfig {
  dev?: {
    port?: number;
    hmr?: boolean;
  };
  static?: {
    outputDir?: string;
    revalidate?: number;
    fallback?: boolean;
  };
  build?: {
    minify?: boolean;
    sourcemap?: boolean;
  };
}

function defineConfig(config: XploraConfig): XploraConfig {
  return {
    dev: {
      port: 3000,
      hmr: true,
      ...config.dev,
    },
    static: {
      outputDir: "./dist",
      revalidate: 3600,
      fallback: false,
      ...config.static,
    },
    build: {
      minify: true,
      sourcemap: true,
      ...config.build,
    },
  };
}

export type { XploraConfig };
export { defineConfig };
