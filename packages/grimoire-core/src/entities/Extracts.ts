import type { PlopGeneratorConfig } from "node-plop";
import type { FnConfig } from "./FnConfig";

export type ExtractFindDir = (extraPath: string) => string;

interface ExtractFnParams {
	findDir: ExtractFindDir;
	config: FnConfig;
}

export type ExtractFn = (
	params: ExtractFnParams,
) => Partial<PlopGeneratorConfig>;

export type ExtractsConfig = Record<
	string,
	ExtractFn | { nameDir: string; extractFn: ExtractFn }
>;
export type Extracts = ExtractsConfig;
