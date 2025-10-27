#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "./grimoire.ts");
const tsxPath = path.resolve(__dirname, "../node_modules/.bin/tsx");

spawn(
	tsxPath,
	["-r", "tsconfig-paths/register", cliPath, ...process.argv.slice(2)],
	{
		stdio: "inherit",
	},
);
