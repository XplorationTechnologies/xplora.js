import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "fast-glob";
import React from "react";
import type { ComponentType, ReactNode } from "react";
import { generateStaticPage } from "xplorajs-react";
import { loadConfig } from "../config.js";
import { convertToRoute, type Route } from "../utils/routes.js";

async function loadLayout(): Promise<ComponentType<{ children: ReactNode }> | null> {
	const layoutPath = join(process.cwd(), "src/app/layout.tsx");
	const file = Bun.file(layoutPath);

	try {
		if (await file.exists()) {
			const module = await import(layoutPath);
			return module.default as ComponentType<{ children: ReactNode }>;
		}
	} catch (error) {
		console.error("Failed to load layout.tsx:", error);
	}

	return null;
}

/**
 * Create a default layout wrapper when no layout.tsx exists
 */
function DefaultLayout({ children }: { children: ReactNode }) {
	return React.createElement(
		"html",
		{ lang: "en" },
		React.createElement(
			"head",
			null,
			React.createElement("meta", { charSet: "utf-8" }),
			React.createElement("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			}),
			React.createElement("link", {
				rel: "stylesheet",
				href: "/assets/style.css",
			}),
		),
		React.createElement("body", null, children),
	);
}

async function processPage(
	page: string,
	route: Route,
	outputDir: string,
	Layout: ComponentType<{ children: ReactNode }> | null,
) {
	try {
		const module = await import(join(process.cwd(), page));
		const PageComponent = module.default;

		const getStaticProps = module.getStaticProps;
		let props = {};

		if (getStaticProps) {
			const result = await getStaticProps();
			props = result.props;
		}

		const pageElement = React.createElement(PageComponent, props);

		// Wrap with layout (user's layout or default)
		const LayoutComponent = Layout || DefaultLayout;
		const content = React.createElement(LayoutComponent, { children: pageElement });

		const outputPath = join(process.cwd(), outputDir, route.path, "index.html");
		await generateStaticPage({
			component: content,
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

	// Load configuration
	const config = await loadConfig();
	const outputDir = config.static.outputDir;

	console.log(`Using output directory: ${outputDir}`);

	await mkdir(join(process.cwd(), outputDir), { recursive: true });
	await mkdir(join(process.cwd(), ".xplora"), { recursive: true });

	// Load layout
	const Layout = await loadLayout();
	if (Layout) {
		console.log("Using layout.tsx for HTML structure");
	} else {
		console.log("No layout.tsx found, using default HTML structure");
	}

	const pages = await glob("src/app/**/page.tsx", {
		ignore: ["**/node_modules/**"],
	});

	const routes: Route[] = [];

	for (const page of pages) {
		const route = convertToRoute(page);
		routes.push(route);
		await processPage(page, route, outputDir, Layout);
	}

	const routesConfig = {
		routes,
		generatedAt: new Date().toISOString(),
	};

	await writeFile(
		join(process.cwd(), ".xplora", "routes.json"),
		JSON.stringify(routesConfig, null, 2),
	);

	console.log("Build completed!");
	console.log("Routes:", routes.map((r) => r.path).join("\n"));
}
