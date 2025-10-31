#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "./grimoire.ts");
const tsxPath = path.resolve(__dirname, "../node_modules/.bin/tsx");

spawn(tsxPath, [cliPath, ...process.argv.slice(2)], {
    stdio: "inherit",
});