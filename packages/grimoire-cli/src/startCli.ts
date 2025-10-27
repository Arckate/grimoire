import path from "node:path";
import { fileURLToPath } from "node:url";
import { startCliFactory } from "@arckate/grimoire-core";
import oldConfig from "~/.cli/config";

const __defaultDirCli = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	`../${oldConfig.cliFolder}`,
);

const startCli = startCliFactory(__defaultDirCli, oldConfig);

export default startCli;
