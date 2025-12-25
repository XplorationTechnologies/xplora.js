#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { copy } from "fs-extra";

const templateDir = join(import.meta.dirname, "..", "template");

async function createApp(name) {
  const targetDir = join(process.cwd(), name);

  await mkdir(targetDir, { recursive: true });
  await copy(templateDir, targetDir);
  execSync("git init", { cwd: targetDir });

  console.log(`
✨ Successfully created ${name}

Next steps:
  cd ${name}
  bun install
  bun run dev

Happy coding! 🚀
  `);
}

const name = process.argv[2];
if (!name) {
  console.error("Please provide a project name");
  process.exit(1);
}

createApp(name).catch(console.error);
