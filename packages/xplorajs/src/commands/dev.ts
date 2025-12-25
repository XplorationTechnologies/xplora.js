import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { serve } from "bun";
import { watch } from "chokidar";
import { glob } from "fast-glob";
import React from "react";
import type { ComponentType } from "react";
import { WebSocketServer } from "ws";
import { renderToStream } from "xplorajs-react";
import { buildCSS } from "./css";

// biome-ignore lint/suspicious/noExplicitAny: <intended>
const pages = new Map<string, ComponentType<Record<string, any>>>();

interface Route {
  path: string;
  file: string;
  isDynamic: boolean;
  params: string[];
}

function convertToRoute(filePath: string): Route {
  const relativePath = filePath.replace("src/app/", "");
  const path = relativePath
    .replace(/\.tsx$/, "")
    .replace(/\/page$/, "")
    .replace(/\[([^\]]+)\]/g, ":$1");

  const params = (relativePath.match(/\[([^\]]+)\]/g) || []).map((param) =>
    param.slice(1, -1),
  );

  return {
    path: path === "page" ? "/" : `/${path}`,
    file: filePath,
    isDynamic: params.length > 0,
    params,
  };
}

async function generateRoutes() {
  await mkdir(join(process.cwd(), ".xplora"), { recursive: true });

  const pageFiles = await glob("src/app/**/*.tsx", {
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

async function loadPages() {
  pages.clear();
  const routes = await generateRoutes();

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

export async function dev() {
  console.log("Starting development server...");

  const wss = new WebSocketServer({ port: 3001 });

  const watcher = watch(["src/**/*"], {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  watcher.on("change", async (path: string) => {
    console.log(`File ${path} has been changed`);

    if (path.endsWith(".css")) {
      // CSS changed - rebuild CSS and notify clients for CSS-only reload
      await buildCSS();
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "css" }));
        }
      }
    } else {
      // TSX/other files changed - reload pages and trigger full reload
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

  serve({
    port: 3000,
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

      const stream = await renderToStream(React.createElement(Page));

      const head = `<!DOCTYPE html><html><head>
				<meta charset="utf-8"/>
				<link rel="stylesheet" href="/assets/style.css"/>
				<script>window.process={env:{NODE_ENV:"development"}};</script>
				</head><body><div id="root">`;

      const foot = `</div>
				<script type="module" src="/client/refresh.js"></script>
				<script type="module" src="/client/hmr.js"></script>
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
