import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { serve } from "bun";
import { watch } from "chokidar";
import { glob } from "fast-glob";
import React from "react";
import type { ComponentType, ReactNode } from "react";
import { WebSocketServer } from "ws";
import { renderToStream } from "xplorajs-react";
import { loadConfig, type ResolvedConfig } from "../config.js";
import { buildCSS } from "./css.js";
import { convertToRoute, type Route } from "../utils/routes.js";

// biome-ignore lint/suspicious/noExplicitAny: <intended>
const pages = new Map<string, ComponentType<Record<string, any>>>();

let Layout: ComponentType<{ children: ReactNode }> | null = null;

async function generateRoutes() {
	await mkdir(join(process.cwd(), ".xplora"), { recursive: true });

	const pageFiles = await glob("src/app/**/page.tsx", {
		ignore: ["**/node_modules/**"],
	});

	const routes: Route[] = pageFiles.map(convertToRoute);

	const routesConfig = {
		routes,
		generatedAt: new Date().toISOString(),
	};

	await writeFile(
		join(process.cwd(), ".xplora", "routes.json"),
		JSON.stringify(routesConfig, null, 2),
	);

	return routes;
}

async function loadLayout(): Promise<ComponentType<{ children: ReactNode }> | null> {
	const layoutPath = join(process.cwd(), "src/app/layout.tsx");
	const file = Bun.file(layoutPath);

	try {
		if (await file.exists()) {
			delete require.cache[layoutPath];
			const module = await import(layoutPath);
			return module.default as ComponentType<{ children: ReactNode }>;
		}
	} catch (error) {
		console.error("Failed to load layout.tsx:", error);
	}

	return null;
}

async function loadPages() {
	pages.clear();
	const routes = await generateRoutes();

	for (const route of routes) {
		const abs = join(process.cwd(), route.file);
		delete require.cache[abs];
		pages.set(
			route.path,
			// biome-ignore lint/suspicious/noExplicitAny: <intended>
			(await import(abs)).default as ComponentType<Record<string, any>>,
		);
	}
}

/**
 * Inject HMR scripts before </body> in the HTML stream
 */
function createHMRInjectionTransform(wsPort: number, hmrEnabled: boolean): TransformStream<Uint8Array, Uint8Array> {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	let buffer = "";

	const hmrScripts = hmrEnabled
		? `<script>window.__XPLORA_WS_PORT__ = ${wsPort};</script>
<script type="module" src="/client/hmr.js"></script>
<script type="module" src="/client/refresh.js"></script>`
		: "";

	const stylesheetLink = `<link rel="stylesheet" href="/assets/style.css"/>`;

	return new TransformStream({
		transform(chunk, controller) {
			buffer += decoder.decode(chunk, { stream: true });

			if (buffer.includes("</head>") && !buffer.includes("/assets/style.css")) {
				buffer = buffer.replace("</head>", `${stylesheetLink}</head>`);
			}

			if (buffer.includes("</body>")) {
				buffer = buffer.replace("</body>", `${hmrScripts}</body>`);
				controller.enqueue(encoder.encode(buffer));
				buffer = "";
			}
		},
		flush(controller) {
			if (buffer.length > 0) {
				if (buffer.includes("</body>")) {
					buffer = buffer.replace("</body>", `${hmrScripts}</body>`);
				} else {
					buffer += hmrScripts;
				}

				if (buffer.includes("</head>") && !buffer.includes("/assets/style.css")) {
					buffer = buffer.replace("</head>", `${stylesheetLink}</head>`);
				}

				controller.enqueue(encoder.encode(buffer));
			}
		},
	});
}

/**
 * Create fallback HTML wrapper when no layout.tsx exists
 */
function createFallbackHtml(wsPort: number, hmrEnabled: boolean): { head: string; foot: string } {
	const hmrScripts = hmrEnabled
		? `<script>window.__XPLORA_WS_PORT__ = ${wsPort};</script>
		<script type="module" src="/client/refresh.js"></script>
		<script type="module" src="/client/hmr.js"></script>`
		: "";

	const head = `<!DOCTYPE html><html><head>
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<link rel="stylesheet" href="/assets/style.css"/>
		<script>window.process={env:{NODE_ENV:"development"}};</script>
		</head><body><div id="root">`;

	const foot = `</div>
		${hmrScripts}
	</body></html>`;

	return { head, foot };
}

export async function dev() {
	console.log("Starting development server...");

	const config = await loadConfig();
	const { port, wsPort, hmr } = config.dev;

	console.log(`Using config: port=${port}, wsPort=${wsPort}, hmr=${hmr}`);

	const wss = new WebSocketServer({ port: wsPort });

	const watcher = watch(["src/**/*"], {
		ignored: /(^|[\/\\])\../,
		persistent: true,
	});

	watcher.on("change", async (path: string) => {
		console.log(`File ${path} has been changed`);

		if (path.endsWith("layout.tsx")) {
			Layout = await loadLayout();
		}

		if (path.endsWith(".css")) {
			await buildCSS();
			for (const client of wss.clients) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ type: "css" }));
				}
			}
		} else {
			await loadPages();
			for (const client of wss.clients) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ type: "reload" }));
				}
			}
		}
	});

	await buildCSS();
	await loadPages();
	Layout = await loadLayout();

	serve({
		port,
		development: true,
		async fetch(req: Request) {
			const url = new URL(req.url);
			const path = url.pathname;

			if (path.startsWith("/assets/")) {
				const f = Bun.file(join(process.cwd(), "dist", path));
				if (await f.exists()) return new Response(f);
			}

			if (path.startsWith("/client/")) {
				const clientPath = join(
					import.meta.dir,
					"..",
					"client",
					path.replace("/client/", ""),
				);
				const f = Bun.file(clientPath);
				if (await f.exists()) {
					return new Response(f, {
						headers: { "Content-Type": "application/javascript" },
					});
				}
			}

			const Page = pages.get(path);
			if (!Page) return new Response("Not Found", { status: 404 });

			const pageElement = React.createElement(Page);

			if (Layout) {
				const content = React.createElement(Layout, { children: pageElement });
				const stream = await renderToStream(content);

				if (typeof stream === "string") {
					let html = stream;
					const hmrScripts = hmr
						? `<script>window.__XPLORA_WS_PORT__ = ${wsPort};</script>
<script type="module" src="/client/hmr.js"></script>
<script type="module" src="/client/refresh.js"></script>`
						: "";
					const stylesheetLink = `<link rel="stylesheet" href="/assets/style.css"/>`;

					if (html.includes("</head>") && !html.includes("/assets/style.css")) {
						html = html.replace("</head>", `${stylesheetLink}</head>`);
					}
					if (html.includes("</body>")) {
						html = html.replace("</body>", `${hmrScripts}</body>`);
					} else {
						html += hmrScripts;
					}

					return new Response(`<!DOCTYPE html>${html}`, {
						headers: { "Content-Type": "text/html; charset=utf-8" },
					});
				}

				const transformedStream = stream.pipeThrough(
					createHMRInjectionTransform(wsPort, hmr),
				);

				return new Response(
					new ReadableStream({
						async start(controller) {
							const doctype = new TextEncoder().encode("<!DOCTYPE html>");
							controller.enqueue(doctype);

							const reader = transformedStream.getReader();
							try {
								while (true) {
									const { done, value } = await reader.read();
									if (done) break;
									controller.enqueue(value);
								}
								controller.close();
							} catch (error) {
								controller.error(error);
							}
						},
					}),
					{ headers: { "Content-Type": "text/html; charset=utf-8" } },
				);
			}

			const stream = await renderToStream(pageElement);
			const { head, foot } = createFallbackHtml(wsPort, hmr);

			return new Response(
				new ReadableStream({
					start(ctrl) {
						ctrl.enqueue(new TextEncoder().encode(head));
						if (typeof stream === "string") {
							ctrl.enqueue(new TextEncoder().encode(stream));
							ctrl.enqueue(new TextEncoder().encode(foot));
							ctrl.close();
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

	console.log(`Development server running at http://localhost:${port}`);
	if (hmr) {
		console.log(`HMR WebSocket server running on port ${wsPort}`);
	}
}
