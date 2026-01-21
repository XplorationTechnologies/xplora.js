#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { build } from "./commands/build.js";
import { dev } from "./commands/dev.js";
import { start } from "./commands/start.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
	readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
);

const program = new Command();

program.name("xplorajs").description("Xplora.js CLI tool").version(pkg.version);

program.command("dev").description("Start development server").action(dev);

program.command("build").description("Build for production").action(build);

program.command("start").description("Start production server").action(start);

program.parse();
