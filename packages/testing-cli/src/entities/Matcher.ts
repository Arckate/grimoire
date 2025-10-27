export type MatchResult<T = unknown> = {
	result: T[];
	errorMessage: string;
};

export type Matcher<T = unknown> = (
	term: T[],
	pattern: string | RegExp,
) => MatchResult<T>;

type FunctionNames<K extends string> =
	| `get${Capitalize<K>}`
	| `query${Capitalize<K>}`
	| `getAll${Capitalize<K>}`
	| `queryAll${Capitalize<K>}`;

export type GeneratedTermFns<T, M extends Record<string, Matcher<T>>> = {
	[K in keyof M as FunctionNames<Extract<K, string>>]: (
		pattern: string | RegExp,
	) => T | T[] | null;
};

export type ConstructorTerm<T, M extends Record<string, Matcher<T>>> = (
	term: T[],
) => GeneratedTermFns<T, M>;

export type FunctionalTermFns<T, M extends Record<string, Matcher<T>>> = {
	[K in keyof M as FunctionNames<Extract<K, string>>]: (
		term: T[] | T,
		pattern: string | RegExp,
	) => T | T[] | null;
};
