import { i18n, tag } from "@site/docusaurusConfig";
import clsx from "clsx";
import { Fragment } from "react";
import type { ResultFilter } from "../../../../hooks/useSearch";
import SearchResults from "../SearchResults";
import styles from "./styles.module.css";

interface SearchWrapperProps {
	results: ResultFilter;
	level?: number;
	term: string;
}

const SearchWrapper: React.FC<SearchWrapperProps> = ({
	results,
	level = 0,
	term,
}) => {
	const { localeConfigs } = i18n;
	const { versionConfigs } = tag;
	const labels = {
		...localeConfigs,
		...versionConfigs,
	};

	return (
		<>
			{Object.entries(results).map(([key, values]) => {
				return (
					<Fragment key={key}>
						<p className={clsx(styles.searchContentInfo, `info-${level}`)}>
							{labels?.[key]?.label}
						</p>
						{Array.isArray(values) ? (
							<SearchResults results={values} term={term} />
						) : (
							<SearchWrapper results={values} level={level + 1} term={term} />
						)}
					</Fragment>
				);
			})}
		</>
	);
};

export default SearchWrapper;
