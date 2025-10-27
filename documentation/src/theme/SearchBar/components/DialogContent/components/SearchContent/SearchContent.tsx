import clsx from "clsx";
import type { ResultFilter } from "../../hooks/useSearch";
import SearchWrapper from "./components/SearchWrapper";
import styles from "./styles.module.css";

interface SearchContentProps {
	results: ResultFilter;
	level?: number;
	term: string;
}

const SearchContent: React.FC<SearchContentProps> = ({ results, term }) => {
	return (
		<div className={clsx(styles.searchContent)}>
			<SearchWrapper results={results} term={term} />
		</div>
	);
};

export default SearchContent;
