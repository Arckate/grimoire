import type { InitsConfig } from "@arckate/grimoire-core/entities";
import defaultInit from "./templates/inits/default/defaultInit";

const config: InitsConfig = {
	default: { initFn: defaultInit, nameDir: "defaultDir" },
};

export default config;
