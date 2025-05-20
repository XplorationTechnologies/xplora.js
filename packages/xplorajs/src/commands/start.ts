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
      const path = url.pathname;

      if (path === "/") {
        return new Response("Hello from XploraJS!");
      }

      return new Response("Not found", { status: 404 });
    },
  });

  console.log("Production server running at http://localhost:3000");
}
