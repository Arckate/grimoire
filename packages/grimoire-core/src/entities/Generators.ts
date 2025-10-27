import type { PlopGeneratorConfig } from "node-plop";
import type { FnConfig } from "./FnConfig";

export type FindDir = (extraPath: string) => string;

interface GeneratorsFnParams {
	findDir: FindDir;
	config: FnConfig;
}

export type GeneratorsFn = (
	params: GeneratorsFnParams,
) => Partial<PlopGeneratorConfig>;

export type Generators = Record<
	string,
	GeneratorsFn | { generatorsFn: GeneratorsFn; nameDir: string }
>;
export type GeneratorsConfig =
	| {
			subGenConf: true;
			[x: string]: Generators | true;
	  }
	| Generators;
