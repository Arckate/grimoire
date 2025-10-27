import type {
	ConstructorContext,
	ConstructorFn,
	Generators,
} from "@arckate/grimoire-core/models";
import { runGen } from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";

interface CtorGenInitParams {
	generator: string;
	params?: Record<string, string>;
	force?: boolean;
}

export const ctorGenInit: ConstructorFn<CtorGenInitParams> = async (
	configKey,
	{ force, generator, params },
	{ cli, dest, force: forceGlobal }: ConstructorContext,
) => {
	cli.addGlobals({ dest: await pathConstructor(cli, dest) });
	const generators = cli.getConfCmd<Generators>(configKey).config;
	await runGen({
		cli,
		args: [generator, params || {}],
		generators,
		force: force || forceGlobal,
	});
};
