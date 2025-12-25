import { join } from "node:path";
import { serve } from "bun";

export async function start() {
  console.log("Starting production server...");

  const config = {
    port: 3000,
  };

  serve({
    port: config.port,
    async fetch(req: Request) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      const distDir = join(process.cwd(), "dist");

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

  console.log("Production server running at http://localhost:3000");
}
