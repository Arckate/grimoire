import { GEN_OBJECT } from "~/const/genObject";
import type { GenObject } from "~/entities/GenObject";
import { sanitizeGenObject } from "./sanitizeGenObject";

interface SeparateArgsAndGenObject {
	genName: string;
	genDest: string;
	genFileName: string;
	argsList: (string | GenObject)[];
	args: Record<string, unknown>;
}

export const separateArgsAndGenObject = (
	{ genName, ...args }: GenObject,
	deep: boolean,
	ignoreDest: boolean,
): SeparateArgsAndGenObject => {
	const separateArgs: SeparateArgsAndGenObject = {
		genName,
		genDest: "",
		genFileName: "",
		argsList: [],
		args: {},
	};

	Object.entries(args).forEach(([name, value]) => {
		if (
			[String(GEN_OBJECT.GEN_ID), String(GEN_OBJECT.GEN_META)].includes(name)
		) {
			return;
		}
		if (
			name === GEN_OBJECT.GEN_DEST &&
			typeof value === "string" &&
			!ignoreDest
		) {
			separateArgs.genDest = value;
			return;
		}
		if (name === GEN_OBJECT.GEN_LINK && typeof value === "string" && deep) {
			separateArgs.argsList.push(value);
			return;
		}

		if (name === GEN_OBJECT.GEN_FILE_NAME && typeof value === "string") {
			separateArgs.genFileName = value;
			return;
		}

		const { isGenObject, isArrays, args } = sanitizeGenObject(value);

		if (isGenObject && isArrays) {
			separateArgs.argsList.push(...args);
		}
		if (isGenObject && !isArrays) {
			separateArgs.argsList.push(args as GenObject);
		}
		separateArgs.args[name] = value;
	});
	return separateArgs;
};
