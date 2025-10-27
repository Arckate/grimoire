import Link from "@docusaurus/Link";
import type { Result } from "@orama/orama";
import type { Doc } from "@site/src/theme/SearchBar/hooks/useOrama";
import clsx from "clsx";
import Highlighter from "react-highlight-words";
import styles from "./styles.module.css";

interface SearchResultsProps {
	results: Result<Doc>[];
	term: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, term }) => {
	return (
		<div className={clsx(styles.searchResults)}>
			{results.map(({ id, document: { title, content, path, category } }) => {
				return (
					<Link
						to={path}
						key={id}
						className={clsx(styles.searchCard, "card-demo")}
					>
						<div className="card">
							<div className="card__header">
								<h3>
									<Highlighter
										highlightClassName="highlight--color"
										searchWords={[term]}
										autoEscape={true}
										textToHighlight={title}
									/>
								</h3>
							</div>
							<div className="card__body">
								<p>
									<Highlighter
										highlightClassName="highlight--color"
										searchWords={[term]}
										autoEscape={true}
										textToHighlight={content}
									/>
								</p>
							</div>
							<div className={clsx(styles.searchCardFooter, "card__footer")}>
								<p>{category}</p>
								<p>{path}</p>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default SearchResults;
