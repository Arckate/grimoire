import type { NavbarItem } from "@docusaurus/theme-common";
import type { Docs } from "./docusaurusConfig";

interface GeneratePluginsParams {
	versions: string[];
	locales: string[];
	docs: Docs;
}

export const generatePlugins = ({
	versions,
	locales,
	docs,
}: GeneratePluginsParams) => {
	return Object.values(docs).flatMap(({ id, path, toPath }) =>
		versions.flatMap((version) =>
			locales.map((locale) => [
				"@docusaurus/plugin-content-docs",
				{
					id: `${id}-${version}-${locale}`,
					path: `${path}/${version}/${locale}`,
					routeBasePath: `${toPath}/${version}/${locale}`,
					sidebarCollapsed: false,
				},
			]),
		),
	);
};

interface GeneratePluginIdsParams {
	versions: string[];
	locales: string[];
	docs: Docs;
}

export const generatePluginIds = ({
	versions,
	locales,
	docs,
}: GeneratePluginIdsParams) => {
	return Object.values(docs)
		.map((doc) => doc.id)
		.flatMap((id) =>
			versions.flatMap((version) =>
				locales.map((locale) => `${id}-${version}-${locale}`),
			),
		);
};

export const generateItemsDocs = (docs: Docs): Partial<NavbarItem>[] => {
	return Object.values(docs).map((doc) => ({
		to: doc.toPath,
		label: doc.label,
		position: doc.position,
	}));
};

export const generateItemsFooterDocs = (docs: Docs): Partial<NavbarItem>[] => {
	return Object.values(docs).map((doc) => ({
		to: doc.toPath,
		label: doc.label,
	}));
};
