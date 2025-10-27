import type { AnyCli, CliDataEngine } from "./CliData";
import type { GeneratorFnConfig } from "./GeneratorFn";

export type GeneratorsFn<TCli extends AnyCli = AnyCli> = (
	ctx: CliDataEngine<TCli>,
) => Partial<
	GeneratorFnConfig<
		ReturnType<TCli["getPrompts"]>,
		ReturnType<TCli["getActions"]>
	>
>;

export type Generators = Record<string, GeneratorsFn>;

export type GeneratorsConfig = Generators;

export type SubGenerators = {
	subGenConf: true;
	[x: string]: Generators | true;
};

export type GeneratorsSubConfig = SubGenerators | Generators;
