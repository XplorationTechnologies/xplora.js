import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { defineConfig, loadConfig, DEFAULT_CONFIG } from "../src/config";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

describe("defineConfig", () => {
	it("should return default values when empty config", () => {
		const config = defineConfig({});

		expect(config.dev.port).toBe(3000);
		expect(config.dev.wsPort).toBe(3001);
		expect(config.dev.hmr).toBe(true);
		expect(config.static.outputDir).toBe("./dist");
		expect(config.static.revalidate).toBe(3600);
		expect(config.static.fallback).toBe(false);
		expect(config.build.minify).toBe(true);
		expect(config.build.sourcemap).toBe(true);
	});

	it("should override default values with custom config", () => {
		const config = defineConfig({
			dev: { port: 4000 },
		});

		expect(config.dev.port).toBe(4000);
		expect(config.dev.wsPort).toBe(4001); // Should auto-increment
		expect(config.dev.hmr).toBe(true);
	});

	it("should allow custom wsPort", () => {
		const config = defineConfig({
			dev: { port: 4000, wsPort: 5000 },
		});

		expect(config.dev.port).toBe(4000);
		expect(config.dev.wsPort).toBe(5000); // Custom value, not auto-incremented
	});

	it("should preserve all custom options", () => {
		const config = defineConfig({
			dev: { port: 5000, wsPort: 5001, hmr: false },
			static: { outputDir: "./out", revalidate: 60, fallback: true },
			build: { minify: false, sourcemap: false },
		});

		expect(config.dev.port).toBe(5000);
		expect(config.dev.wsPort).toBe(5001);
		expect(config.dev.hmr).toBe(false);
		expect(config.static.outputDir).toBe("./out");
		expect(config.static.revalidate).toBe(60);
		expect(config.static.fallback).toBe(true);
		expect(config.build.minify).toBe(false);
		expect(config.build.sourcemap).toBe(false);
	});
});

describe("loadConfig", () => {
	const originalCwd = process.cwd();
	let testDir: string;

	beforeEach(async () => {
		// Create unique test directory for each test to avoid import caching issues
		testDir = join(process.cwd(), `.test-config-${Date.now()}-${Math.random().toString(36).slice(2)}`);
		await mkdir(testDir, { recursive: true });
		process.chdir(testDir);
	});

	afterEach(async () => {
		process.chdir(originalCwd);
		await rm(testDir, { recursive: true, force: true });
	});

	it("should return default config when no config file exists", async () => {
		const config = await loadConfig();

		expect(config.dev.port).toBe(DEFAULT_CONFIG.dev.port);
		expect(config.dev.wsPort).toBe(DEFAULT_CONFIG.dev.wsPort);
		expect(config.dev.hmr).toBe(DEFAULT_CONFIG.dev.hmr);
		expect(config.static.outputDir).toBe(DEFAULT_CONFIG.static.outputDir);
	});

	it("should load config from xplora.config.ts", async () => {
		const configContent = `
			export default {
				dev: { port: 8080 },
				static: { outputDir: "./build" }
			};
		`;
		await writeFile(join(testDir, "xplora.config.ts"), configContent);

		const config = await loadConfig();

		expect(config.dev.port).toBe(8080);
		expect(config.dev.wsPort).toBe(8081); // Auto-incremented
		expect(config.static.outputDir).toBe("./build");
	});

	it("should merge user config with defaults", async () => {
		const configContent = `
			export default {
				dev: { port: 9000 }
			};
		`;
		await writeFile(join(testDir, "xplora.config.ts"), configContent);

		const config = await loadConfig();

		// Custom value
		expect(config.dev.port).toBe(9000);
		// Default values preserved
		expect(config.dev.hmr).toBe(true);
		expect(config.static.outputDir).toBe("./dist");
		expect(config.build.minify).toBe(true);
	});
});
