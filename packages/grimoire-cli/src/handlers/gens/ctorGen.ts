import { TYPE_GEN } from "@arckate/grimoire-core/const";
import type {
	ConstructorContext,
	ConstructorFn,
	GeneratorsSubConfig,
} from "@arckate/grimoire-core/models";
import { findGenerators, runGen } from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";

interface CtorGenParams {
	typeGen?: string;
	generator: string;
	params?: Record<string, string>;
	force?: boolean;
}

export const ctorGen: ConstructorFn<CtorGenParams> = async (
	configKey,
	{ force, generator, params, typeGen },
	{ cli, dest, force: forceGlobal }: ConstructorContext,
) => {
	cli.addGlobals({ dest: await pathConstructor(cli, dest) });
	const generators = await findGenerators({
		cli,
		config: cli.getConfCmd<GeneratorsSubConfig>(configKey).config,
		typeGen: typeGen || TYPE_GEN,
	});
	await runGen({
		cli,
		args: [generator, params || {}],
		generators,
		force: force || forceGlobal,
	});
};
