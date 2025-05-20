#!/usr/bin/env node
import { Command } from "commander";
import { build } from "./commands/build";
import { dev } from "./commands/dev";
import { start } from "./commands/start";

const program = new Command();

program.name("xplorajs").description("Xplora.js CLI tool").version("0.0.0");

program.command("dev").description("Start development server").action(dev);

program.command("build").description("Build for production").action(build);

program.command("start").description("Start production server").action(start);

program.parse();
