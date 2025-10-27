import type { Result } from "@orama/orama";
import type { Doc } from "@site/src/theme/SearchBar/hooks/useOrama";
import type { ResultFilter } from "../useSearch";
import { filteredDocs } from "./filteredDocs";
import { setupSort } from "./setupSort";

interface SortAndFilterParams {
	results: Result<Doc>[];
	locale: string;
	version: string;
	docs: string[];
	versions: string[];
	locales: string[];
}

export const sortAndFilter = ({
	results,
	locale,
	version,
	docs: docsFilter,
	versions: versionsFilter,
	locales: localesFilter,
}: SortAndFilterParams): ResultFilter => {
	const { docs, versions, locales } = setupSort({
		docsFilter,
		versionsFilter,
		localesFilter,
		locale,
		version,
	});
	return filteredDocs({ results, docs, versions, locales });
};
