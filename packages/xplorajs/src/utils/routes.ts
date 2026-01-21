/**
 * Shared route utilities for XploraJS
 */

export interface Route {
	path: string;
	file: string;
	isDynamic: boolean;
	params: string[];
}

/**
 * Convert a file path to a Route object
 * @param filePath - The file path relative to the project root (e.g., "src/app/page.tsx")
 * @returns Route object with path, file, isDynamic, and params
 */
export function convertToRoute(filePath: string): Route {
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
