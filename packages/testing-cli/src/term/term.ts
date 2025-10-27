import type {
	ConstructorTerm,
	FunctionalTermFns,
	GeneratedTermFns,
	Matcher,
} from "../entities/Matcher";
import { MatcherError } from "../errors/MatcherError";
import { createFunctionalMatchers } from "./createFunctionalMatchers";
import { inAll } from "./inAll";
import { inFirst } from "./inFirst";
import { inLast } from "./inLast";

const matchers = { inAll, inLast, inFirst } satisfies Record<
	string,
	Matcher<string>
>;

export const constructorTerm: ConstructorTerm<string, typeof matchers> = (
	term: string[],
) => {
	const rawFns = createFunctionalMatchers(matchers);
	const termFn: Record<string, any> = {};

	for (const [key, fn] of Object.entries(rawFns)) {
		const getFn = (pattern: string | RegExp) => {
			try {
				return fn(term, pattern);
			} catch (err) {
				throw new MatcherError(err.message, getFn);
			}
		};
		termFn[key] = getFn;
	}

	return termFn as GeneratedTermFns<string, typeof matchers>;
};

const result = createFunctionalMatchers(matchers);

export default result as FunctionalTermFns<string, typeof matchers>;
