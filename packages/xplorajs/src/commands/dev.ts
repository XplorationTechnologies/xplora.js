import { readFileSync } from "node:fs";
import { join } from "node:path";
import { serve } from "bun";
import { watch } from "chokidar";
import React from "react";
import type { ComponentType } from "react";
import { WebSocketServer } from "ws";
import { renderToStream } from "xplorajs-react";
import { build } from "./build";

// biome-ignore lint/suspicious/noExplicitAny: <intended>
const pages = new Map<string, ComponentType<Record<string, any>>>();

async function loadPages() {
	pages.clear();
	const routes = await loadRoutes();

	for (const route of routes) {
		const abs = join(process.cwd(), route.file);
		delete import.meta.require?.cache?.[abs];
		pages.set(
			route.path,
			// biome-ignore lint/suspicious/noExplicitAny: <intended>
			(await import(abs)).default as ComponentType<Record<string, any>>,
		);
	}
}

async function loadRoutes() {
	try {
		const routesPath = join(process.cwd(), ".xplora", "routes.json");
		const routesContent = readFileSync(routesPath, "utf-8");
		return JSON.parse(routesContent).routes;
	} catch {
		return [];
	}
}

export async function dev() {
	console.log("Starting development server...");

	const wss = new WebSocketServer({ port: 3001 });

	const watcher = watch(["src/**/*"], {
		ignored: /(^|[\/\\])\../,
		persistent: true,
	});

	watcher.on("change", async (path: string) => {
		console.log(`File ${path} has been changed`);
		await build();
		await loadPages();

		for (const client of wss.clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ type: "reload" }));
			}
		}
	});

	await build();
	await loadPages();

	serve({
		port: 3000,
		development: true,
		async fetch(req: Request) {
			const url = new URL(req.url);
			const path = url.pathname;

			if (path === "/") {
				return new Response("Hello from XploraJS!");
			}

			if (path.startsWith("/assets/")) {
				const f = Bun.file(join(process.cwd(), "dist", path));
				if (await f.exists()) return new Response(f);
			}

			const Page = pages.get(path);
			if (!Page) return new Response("Not Found", { status: 404 });

			const stream = await renderToStream(React.createElement(Page));

			const head = `<!DOCTYPE html><html><head>
				<meta charset="utf-8"/>
				<link rel="stylesheet" href="/assets/style.css"/>
				<script>window.process={env:{NODE_ENV:"development"}};</script>
				</head><body><div id="root">`;

			const foot = `</div>
				<script type="module">
					import * as RefreshRuntime from "https://esm.sh/react-refresh@0.17.0/runtime";
					if (window.process?.env?.NODE_ENV === "development") {
						console.log("Fast refresh runtime loaded in development mode");
					}
					RefreshRuntime.injectIntoGlobalHook(window);
					window.$RefreshReg$=()=>{};
					window.$RefreshSig$=()=>t=>t;
				</script>
				<script>
					const ws=new WebSocket("ws://localhost:3001");
					ws.onmessage=async e=>{
						if(e.data==="css"){
							document.querySelectorAll('link[rel="stylesheet"]').forEach(l=>l.href="/assets/style.css?v="+Date.now());
						}
						if(e.data==="reload"){
							console.log("Reloading...");
							location.reload();
						}
					};
				</script>
			</body></html>`;

			return new Response(
				new ReadableStream({
					start(ctrl) {
						ctrl.enqueue(new TextEncoder().encode(head));
						if (typeof stream === "string") {
							ctrl.enqueue(new TextEncoder().encode(stream));
						} else {
							stream.pipeTo(
								new WritableStream({
									write(c) {
										ctrl.enqueue(c);
									},
									close() {
										ctrl.enqueue(new TextEncoder().encode(foot));
										ctrl.close();
									},
								}),
							);
						}
					},
				}),
				{ headers: { "Content-Type": "text/html; charset=utf-8" } },
			);
		},
	});

	console.log("Development server running at http://localhost:3000");
}
