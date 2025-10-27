import type { Result } from "@orama/orama";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import { useEffect, useState } from "react";
import type { Doc, Search } from "../../../hooks/useOrama";
import { sortAndFilter } from "./utils/sortAndFilter";

export type ResultFilter =
	| Record<string, Result<Doc>[]>
	| Record<string, Record<string, Result<Doc>[]>>;

interface UseSearchProps {
	search: Search;
	term: "";
	docs: string[];
	versions: string[];
	locales: string[];
}

interface UseSearch {
	results: ResultFilter;
}

export const useSearch = ({
	search,
	term,
	docs,
	versions,
	locales,
}: UseSearchProps): UseSearch => {
	const { version } = useVersion();
	const { locale } = useLocale();
	const [results, setResults] = useState<ResultFilter>({ all: [] });

	useEffect(() => {
		if (search && docs && versions && locales) {
			const createResult = async () => {
				const res = await search({ term, limit: 999999 });
				const searchResults = res?.hits || [];
				const filterResults = sortAndFilter({
					results: searchResults,
					locale,
					version,
					docs,
					versions,
					locales,
				});
				setResults(filterResults);
			};
			createResult();
		}
	}, [search, docs?.length, versions?.length, locales?.length, term]);

	return { results };
};
