import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { docs as docsConfig, i18n, tag } from "@site/docusaurusConfig";
import clsx from "clsx";
import { useState } from "react";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import MultiSelect from "./components/MultiSelect/MultiSelect";
import styles from "./styles.module.css";

interface SearchFiltersProps {
	docs: string[];
	versions: string[];
	locales: string[];
	handleDocs: (parts: string[]) => void;
	handleVersions: (versions: string[]) => void;
	handleLocales: (locales: string[]) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
	docs,
	versions,
	locales,
	handleDocs,
	handleLocales,
	handleVersions,
}) => {
	const { shouldRender } = useNavbarMobileSidebar();
	const [open, setOpen] = useState<boolean>(!shouldRender);

	const docsValues = Object.entries(docsConfig).map(([locales, { label }]) => ({
		value: locales,
		label: label,
	}));
	const versionValues = Object.entries(tag.versionConfigs).map(
		([locales, { label }]) => ({
			value: locales,
			label: label,
		}),
	);
	const localeValues = Object.entries(i18n.localeConfigs).map(
		([locales, { label }]) => ({
			value: locales,
			label: label,
		}),
	);

	return (
		<div className={clsx(styles.searchFiltersWrapper)}>
			<button type="button" onClick={() => setOpen((old: boolean) => !old)}>
				{open ? (
					<MdFilterAlt className="github__icon" />
				) : (
					<MdFilterAltOff className="github__icon" />
				)}
				filters
			</button>

			<div className={clsx(styles.searchFilters, !open && styles.display)}>
				<MultiSelect
					labelKey="docs"
					defaultValues={docs}
					values={docsValues}
					handle={handleDocs}
				/>
				<MultiSelect
					labelKey="versions"
					defaultValues={versions}
					values={versionValues}
					handle={handleVersions}
				/>
				<MultiSelect
					labelKey="locales"
					defaultValues={locales}
					values={localeValues}
					handle={handleLocales}
				/>
			</div>
		</div>
	);
};

export default SearchFilters;
