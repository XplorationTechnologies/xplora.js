import { existsSync } from "node:fs";
import { join } from "node:path";

export interface XploraConfig {
	dev?: {
		port?: number;
		wsPort?: number;
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

export interface ResolvedConfig {
	dev: {
		port: number;
		wsPort: number;
		hmr: boolean;
	};
	static: {
		outputDir: string;
		revalidate: number;
		fallback: boolean;
	};
	build: {
		minify: boolean;
		sourcemap: boolean;
	};
}

const DEFAULT_CONFIG: ResolvedConfig = {
	dev: {
		port: 3000,
		wsPort: 3001,
		hmr: true,
	},
	static: {
		outputDir: "./dist",
		revalidate: 3600,
		fallback: false,
	},
	build: {
		minify: true,
		sourcemap: true,
	},
};

/**
 * Define a configuration object with defaults merged in
 */
function defineConfig(config: XploraConfig): ResolvedConfig {
	return {
		dev: {
			port: config.dev?.port ?? DEFAULT_CONFIG.dev.port,
			wsPort: config.dev?.wsPort ?? (config.dev?.port ? config.dev.port + 1 : DEFAULT_CONFIG.dev.wsPort),
			hmr: config.dev?.hmr ?? DEFAULT_CONFIG.dev.hmr,
		},
		static: {
			outputDir: config.static?.outputDir ?? DEFAULT_CONFIG.static.outputDir,
			revalidate: config.static?.revalidate ?? DEFAULT_CONFIG.static.revalidate,
			fallback: config.static?.fallback ?? DEFAULT_CONFIG.static.fallback,
		},
		build: {
			minify: config.build?.minify ?? DEFAULT_CONFIG.build.minify,
			sourcemap: config.build?.sourcemap ?? DEFAULT_CONFIG.build.sourcemap,
		},
	};
}

/**
 * Load configuration from xplora.config.ts in the current working directory.
 * Falls back to default configuration if no config file is found.
 */
async function loadConfig(): Promise<ResolvedConfig> {
	const configPath = join(process.cwd(), "xplora.config.ts");

	try {
		if (existsSync(configPath)) {
			// Clear cache to support HMR of config
			delete require.cache[configPath];
			const userConfig = (await import(configPath)).default as XploraConfig;
			return defineConfig(userConfig);
		}
	} catch (error) {
		console.warn("Warning: Failed to load xplora.config.ts, using defaults");
		if (error instanceof Error) {
			console.warn(`  Reason: ${error.message}`);
		}
	}

	return defineConfig({});
}

export { defineConfig, loadConfig, DEFAULT_CONFIG };
