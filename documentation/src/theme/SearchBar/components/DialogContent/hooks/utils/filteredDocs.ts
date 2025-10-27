import type { Result } from "@orama/orama";
import type { Doc } from "@site/src/theme/SearchBar/hooks/useOrama";
import type { ResultFilter } from "../useSearch";

interface FilteredDocsParams {
	results: Result<Doc>[];
	docs: string[];
	versions: string[];
	locales: string[];
}

export const filteredDocs = ({
	results,
	docs,
	versions,
	locales,
}: FilteredDocsParams): ResultFilter => {
	let innerResults = [...results];
	let paths: ResultFilter = {};
	if (docs.length) {
		innerResults = docs.flatMap((docId) => {
			return results.flatMap((result) => {
				if (result.document.path.includes(`/${docId}`)) {
					return [result];
				}
				return [];
			});
		});
	}

	const innerPaths: Record<string, Result<Doc>[]> = {};
	if (versions.length) {
		versions.forEach((version) => {
			innerPaths[version] = innerResults.flatMap((result) => {
				if (result.document.path.includes(`/${version}`)) {
					return [result];
				}
				return [];
			});
		});
	}

	if (locales.length) {
		const setLocals = (
			values: Result<Doc>[],
			object: Record<string, Result<Doc>[]>,
		): Record<string, Result<Doc>[]> => {
			locales.forEach((locale) => {
				object[locale] = values.flatMap((result) => {
					if (result.document.path.includes(`/${locale}`)) {
						return [result];
					}
					return [];
				});
			});
			return object;
		};
		if (Object.values(innerPaths).length) {
			Object.entries(innerPaths).forEach(([version, values]) => {
				paths[version] = setLocals(values, {});
			});
		} else {
			paths = setLocals(innerResults, {});
		}
	}

	if (!locales.length && !versions.length && !docs.length) {
		paths = { all: innerResults };
	}

	return paths;
};
