import type { Cli } from "~/Cli";
import { PLAN_EXT } from "~/const";
import type { RecordCamelCase } from "~/models";
import { FilePathError } from "~/errors";
import {
	findAllPlanFile,
	isPlanFile,
	pathConstructor,
	pathValidating,
} from "~/path";

interface findPlanFileArgsParams {
	cli: Cli;
	inPath?: string;
	parentConfig: RecordCamelCase<string, string> | null;
}

export const findPlanFileArgs = async ({
	cli,
	inPath,
	parentConfig,
}: findPlanFileArgsParams): Promise<string[]> => {
	const toPlans = await pathConstructor(cli, inPath);
	const { isValidPath, isDirectory, isFile } = await pathValidating(
		cli,
		toPlans,
	);
	if (isValidPath) {
		const argsList: string[] = [];
		if (isDirectory) {
			const allPlans = await findAllPlanFile(cli, toPlans);
			argsList.push(...allPlans);
		} else if (isFile && isPlanFile(cli, toPlans, parentConfig)) {
			argsList.push(toPlans);
		} else {
			throw new FilePathError(
				`Only ".plan.${parentConfig?.planExt || PLAN_EXT}" files are allowed.`,
			);
		}
		if (argsList.length) {
			return argsList;
		}

		throw new FilePathError(
			`No ".plan.${parentConfig?.planExt || PLAN_EXT}" files are allowed.`,
		);
	}
};
