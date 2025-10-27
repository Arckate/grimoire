#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "./grimoire.ts");

function bunAvailable() {
	try {
		spawn.sync("bun", ["--version"]);
		return true;
	} catch {
		return false;
	}
}

if (bunAvailable()) {
	spawn("bun", ["run", cliPath, ...process.argv.slice(2)], {
		stdio: "inherit",
	});
	process.exit(0);
}

const tsxPath =
	process.platform === "win32"
		? path.resolve(__dirname, "../node_modules/.bin/tsx.cmd")
		: path.resolve(__dirname, "../node_modules/.bin/tsx");

spawn(
	tsxPath,
	["-r", "tsconfig-paths/register", cliPath, ...process.argv.slice(2)],
	{
		stdio: "inherit",
	},
);
