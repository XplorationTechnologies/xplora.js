import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { glob } from "fast-glob";
import React from "react";
import { generateStaticPage } from "xplorajs-react";

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

async function processPage(page: string, route: Route) {
	try {
		// Import page component
		const module = await import(join(process.cwd(), page));
		const PageComponent = module.default;

		// Check if page has getStaticProps
		const getStaticProps = module.getStaticProps;
		let props = {};

		if (getStaticProps) {
			const result = await getStaticProps();
			props = result.props;
		}

		// Generate static HTML
		const outputPath = join(process.cwd(), "dist", route.path, "index.html");
		await generateStaticPage({
			component: React.createElement(PageComponent, props),
			outputPath,
			props,
		});

		console.log(`Generated ${outputPath}`);
	} catch (error) {
		console.error(`Error processing ${page}:`, error);
	}
}

export async function build() {
	console.log("Building application...");

	// Create dist directory
	await mkdir(join(process.cwd(), "dist"), { recursive: true });

	// Find all page files
	const pages = await glob("src/app/**/*.tsx", {
		ignore: ["**/node_modules/**"],
	});

	const routes: Route[] = [];

	// Process each page
	for (const page of pages) {
		const route = convertToRoute(page);
		routes.push(route);
		await processPage(page, route);
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
