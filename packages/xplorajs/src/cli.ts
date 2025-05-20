#!/usr/bin/env node
import { Command } from "commander";
import { build } from "./commands/build.js";
import { dev } from "./commands/dev.js";
import { start } from "./commands/start.js";

const program = new Command();

program.name("xplorajs").description("Xplora.js CLI tool").version("0.0.0");

program.command("dev").description("Start development server").action(dev);

program.command("build").description("Build for production").action(build);

program.command("start").description("Start production server").action(start);

program.parse();
