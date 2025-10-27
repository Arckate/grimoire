import type { Matcher } from "../entities/Matcher";
import { MatcherError } from "../errors/MatcherError";

const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const createFunctionalMatchers = <T extends string = string>(
	matchers: Record<string, Matcher<T>>,
) => {
	const api: Record<string, any> = {};

	for (const [key, matcher] of Object.entries(matchers)) {
		const capital = capitalize(key);

		api[`get${capital}`] = (term: T[] | T, pattern: string | RegExp): T => {
			let innerTerm = term;
			if (!Array.isArray(innerTerm)) {
				innerTerm = [term] as T[];
			}
			const { result, errorMessage } = matcher(innerTerm, pattern);
			if (result.length !== 1)
				throw new MatcherError(errorMessage, api[`get${capital}`]);
			return result[0];
		};

		api[`query${capital}`] = (
			term: T[] | T,
			pattern: string | RegExp,
		): T | null => {
			let innerTerm = term;
			if (!Array.isArray(innerTerm)) {
				innerTerm = [term] as T[];
			}
			const { result } = matcher(innerTerm, pattern);
			return result.length === 1 ? result[0] : null;
		};

		api[`getAll${capital}`] = (
			term: T[] | T,
			pattern: string | RegExp,
		): T[] => {
			let innerTerm = term;
			if (!Array.isArray(innerTerm)) {
				innerTerm = [term] as T[];
			}
			const { result, errorMessage } = matcher(innerTerm, pattern);
			if (result.length === 0)
				throw new MatcherError(errorMessage, api[`get${capital}`]);
			return result;
		};

		api[`queryAll${capital}`] = (
			term: T[] | T,
			pattern: string | RegExp,
		): T[] | null => {
			let innerTerm = term;
			if (!Array.isArray(innerTerm)) {
				innerTerm = [term] as T[];
			}
			const { result } = matcher(innerTerm, pattern);
			return result.length > 0 ? result : null;
		};
	}

	return api;
};
