#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import prompts from "prompts";

async function main() {
  const { name, ts } = await prompts([
    { type: "text", name: "name", message: "Project name:" },
  ]);

  if (!name) process.exit(1);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const target = path.resolve(process.cwd(), name);
  if (await fs.pathExists(target)) {
    console.error("❌ Folder already exists");
    process.exit(1);
  }

  const tplDir = path.resolve(__dirname, "../template");
  if (!(await fs.pathExists(tplDir))) {
    console.error("❌ Template not found");
    process.exit(1);
  }

  await fs.copy(tplDir, target);

  const pkgPath = path.join(target, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = name;
  if (!ts) {
    pkg.devDependencies = { ...pkg.devDependencies };
    if (pkg.devDependencies?.typescript) {
      const { typescript, ...rest } = pkg.devDependencies;
      pkg.devDependencies = rest;
    }
    pkg.tsconfig = undefined;
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log(`\n✅ Project "${name}" successfully created`);
  console.log("\nTo start the project, run the following commands:");
  console.log(`   cd ${name}\n   bun install\n   bun run dev`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
