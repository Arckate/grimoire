import { CONF_EXTRACTS } from "@arckate/grimoire-core/const";
import type {
	ConstructorContext,
	ConstructorFn,
	Generators,
} from "@arckate/grimoire-core/models";
import { runGen } from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";

type GenExtractParams = {
	generator: string;
	in?: string;
	out?: string;
	force?: boolean;
};

export const ctorGenExtract: ConstructorFn<GenExtractParams> = async (
	configKey,
	{ in: inPath, out: outPath, force },
	{ cli, args, dest, force: forceGlobal }: ConstructorContext,
) => {
	const generators = cli.getConfCmd<Generators>(
		configKey || CONF_EXTRACTS,
	).config;
	cli.addGlobals({ dest: await pathConstructor(cli, outPath ?? dest) });
	if (inPath) cli.addGlobals({ inPath });
	await runGen({
		args: Array.isArray(args) ? args : [],
		generators,
		cli,
		force: force || forceGlobal,
	});
};
