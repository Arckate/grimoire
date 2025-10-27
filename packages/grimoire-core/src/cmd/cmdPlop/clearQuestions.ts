import { SKIP_PARAMS_VALUE } from "~/const/skippedParams";
import type { ProcessTerm } from "~/entities/ProcessTerm";
import { removeLine } from "~/prompts/removeLine";

export const clearQuestions = (
	processTerm: ProcessTerm,
	args: string[],
	sanitizeArgs: any,
): void => {
	const argsValidCount = args.filter(
		(args) => args !== SKIP_PARAMS_VALUE,
	).length;
	const sanitizeArgsCount = Object.values(sanitizeArgs).length;
	removeLine({ processTerm, nb: sanitizeArgsCount - argsValidCount });
};
