import type { PlopGeneratorConfig } from "node-plop";
import type { FnConfig } from "./FnConfig";

export type InitFindDir = (extraPath: string) => string;
interface InitFnParams {
	findDir?: InitFindDir;
	config: FnConfig;
}

export type InitFn = (params: InitFnParams) => Partial<PlopGeneratorConfig>;

export type InitsConfig = Record<
	string,
	InitFn | { nameDir: string; initFn: InitFn }
>;
export type Inits = InitsConfig;
