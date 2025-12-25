import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { $, file } from "bun";

/**
 * Build CSS with Tailwind CSS v4.
 * Reads src/app/styles.css and outputs to dist/assets/style.css
 */
export async function buildCSS() {
  const inputPath = join(process.cwd(), "src/app/styles.css");
  const outputPath = join(process.cwd(), "dist/assets/style.css");

  const inputFile = file(inputPath);
  if (!(await inputFile.exists())) {
    console.log("No styles.css found, skipping CSS build");
    return;
  }

  await mkdir(join(process.cwd(), "dist/assets"), { recursive: true });

  try {
    await $`bunx tailwindcss -i ${inputPath} -o ${outputPath} --minify`.quiet();
    console.log("CSS built successfully");
  } catch (error) {
    console.error("CSS build failed:", error);
    throw error;
  }
}
