import { useDoc } from "@site/src/contexts/docContext";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { type ChangeEventHandler, useState } from "react";
import type { Search } from "../../hooks/useOrama";
import SearchContent from "./components/SearchContent";
import SearchFilters from "./components/SearchFilters/SearchFilters";
import SearchInput from "./components/SearchInput/SearchInput";
import { useSearch } from "./hooks/useSearch";
import styles from "./styles.module.css";

interface DialogContentProps {
	search: Search;
}

const dialogContent: React.FC<DialogContentProps> = ({ search }) => {
	const { version } = useVersion();
	const { locale } = useLocale();
	const { doc } = useDoc();

	const [term, setTerm] = useState("");
	const [docs, setDocs] = useState<string[]>(doc ? [doc] : []);
	const [versions, setVersions] = useState<string[]>([version]);
	const [locales, setLocales] = useState<string[]>([locale]);

	const { results } = useSearch({ search, term, docs, versions, locales });

	const handleSearch = async (e: ChangeEventHandler<HTMLInputElement>) => {
		setTerm(e.target.value);
	};
	const handleDocs = async (docValue: string[]) => {
		setDocs(docValue);
	};
	const handleVersions = async (versionValues: string[]) => {
		setVersions(versionValues);
	};
	const handleLocales = async (localeValues: string[]) => {
		setLocales(localeValues);
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: <stopPropagation>
		// biome-ignore lint/a11y/useKeyWithClickEvents: <stopPropagation>
		<div
			className={clsx(styles.dialogContent)}
			onClick={(e) => {
				e.stopPropagation();
			}}
		>
			<SearchInput handleChange={debounce(handleSearch, 500)} />
			<SearchFilters
				docs={doc ? [doc] : []}
				versions={[version]}
				locales={[locale]}
				handleDocs={handleDocs}
				handleVersions={handleVersions}
				handleLocales={handleLocales}
			/>
			<SearchContent results={results} term={term} />
		</div>
	);
};

export default dialogContent;
