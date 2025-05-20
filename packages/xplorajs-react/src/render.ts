import fs from "node:fs/promises";
import path from "node:path";
import type React from "react";
import { renderToReadableStream, renderToString } from "react-dom/server";

/**
 * Render React element ke stream HTML untuk development mode (SSR).
 * Otomatis fallback ke string jika Streaming tidak didukung.
 */
export async function renderToStream(element: React.ReactElement) {
  if (typeof renderToReadableStream === "function") {
    return renderToReadableStream(element);
  }
  return renderToString(element);
}

/**
 * Generate static HTML file untuk production mode (SSG).
 */
export async function generateStaticPage(options: {
  component: React.ReactElement;
  outputPath: string;
  props?: Record<string, unknown>;
}) {
  const { component, outputPath } = options;

  const html = await renderToString(component);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await fs.writeFile(outputPath, html);
}

/**
 * Get static props untuk data fetching di build time.
 */
export async function getStaticProps(
  fn: () => Promise<Record<string, unknown>>,
) {
  try {
    const props = await fn();
    return {
      props,
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {},
      revalidate: 3600,
    };
  }
}
