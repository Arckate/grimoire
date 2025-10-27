import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../.cli/config";
import startCli from "../src/startCli";

const __dirCli = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	`../${config.cliFolder}`,
);
startCli(config, __dirCli);
