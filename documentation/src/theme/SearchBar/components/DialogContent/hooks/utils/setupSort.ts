import { docs as docsConfig, i18n, tag } from "@site/docusaurusConfig";

interface SetupSortParams {
	locale: string;
	version: string;
	docsFilter: string[];
	versionsFilter: string[];
	localesFilter: string[];
}

interface SetupSort {
	docs: string[];
	versions: string[];
	locales: string[];
}

export const setupSort = ({
	locale,
	version,
	docsFilter,
	versionsFilter,
	localesFilter,
}: SetupSortParams): SetupSort => {
	const { locales: localesConf } = i18n;
	const locales = localesConf.filter(
		(inLocale) =>
			(localesFilter.includes(inLocale) || !localesFilter.length) &&
			locale !== inLocale,
	);
	if (locale) {
		locales.unshift(locale);
	}
	const { versions: versionsConf } = tag;

	const versions = versionsConf.filter(
		(inVersion) =>
			(versionsFilter.includes(inVersion) || !versionsFilter.length) &&
			version !== inVersion,
	);
	if (version) {
		versions.unshift(version);
	}
	const docs = Object.values(docsConfig).flatMap(({ id }) => {
		if (docsFilter.includes(id) || !docsFilter.length) {
			return [id];
		}
		return [];
	});

	return {
		docs,
		versions,
		locales,
	};
};
