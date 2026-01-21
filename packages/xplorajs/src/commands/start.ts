import { join } from "node:path";
import { serve } from "bun";
import { loadConfig } from "../config.js";

export async function start() {
	console.log("Starting production server...");

	const config = await loadConfig();
	const { port } = config.dev;
	const { outputDir } = config.static;

	const distDir = join(process.cwd(), outputDir);

	serve({
		port,
		async fetch(req: Request) {
			const url = new URL(req.url);
			const pathname = url.pathname;

			let filePath: string;

			if (pathname.includes(".")) {
				filePath = join(distDir, pathname);
			} else {
				filePath = join(distDir, pathname, "index.html");
			}

			const file = Bun.file(filePath);

			if (await file.exists()) {
				return new Response(file);
			}

			return new Response("Not found", { status: 404 });
		},
	});

	console.log(`Production server running at http://localhost:${port}`);
	console.log(`Serving files from: ${distDir}`);
}
