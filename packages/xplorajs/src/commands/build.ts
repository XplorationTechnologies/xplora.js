import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "fast-glob";

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

export async function build() {
	console.log("Building application...");

	// Find all page files
	const pages = await glob("src/app/**/*.tsx", {
		ignore: ["**/node_modules/**"],
	});

	const routes: Route[] = [];

	// Process each page
	for (const page of pages) {
		const route = convertToRoute(page);
		routes.push(route);

		const content = await readFile(page, "utf-8");
		// TODO: Implement page processing logic
		console.log(`Processing ${page} -> ${route.path}`);
	}

	// Generate routes configuration
	const routesConfig = {
		routes,
		generatedAt: new Date().toISOString(),
	};

	// Write routes configuration
	await writeFile(
		join(process.cwd(), ".xplora", "routes.json"),
		JSON.stringify(routesConfig, null, 2),
	);

	console.log("Build completed!");
	console.log("Routes:", routes.map((r) => r.path).join("\n"));
}
