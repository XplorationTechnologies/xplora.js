import { readFileSync, writeFileSync } from "node:fs";

const file = "dist/cli.js";
const content = readFileSync(file, "utf8");
const fixed = content.replace(/^#!.*\n/, "#!/usr/bin/env bun\n");
writeFileSync(file, fixed, "utf8");
console.log("Shebang dist/cli.js sudah diganti ke bun!");
