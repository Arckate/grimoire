import { DEFAULT_INIT } from "@arckate/grimoire-core/const";
import type {
	ConstructorContext,
	ConstructorFn,
	Generators,
} from "@arckate/grimoire-core/models";
import { runGen } from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";

interface CtorInitParams {
	out?: string;
	force?: boolean;
	ignorePrompts?: boolean;
}

export const ctorInit: ConstructorFn<CtorInitParams> = async (
	configKey,
	{ force },
	{ cli, dest, force: forceGlobal }: ConstructorContext,
) => {
	const config = cli.getConfig();
	cli.addGlobals({ dest: await pathConstructor(cli, dest) });
	const generators = cli.getConfCmd<Generators>(configKey).config;
	await runGen({
		cli,
		args: [DEFAULT_INIT, config.configFileExt, config.configFileType],
		generators,
		force: force || forceGlobal,
	});
};
