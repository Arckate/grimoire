import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { docs, i18n, tag } from "./docusaurusConfig";
import {
	generateItemsDocs,
	generateItemsFooterDocs,
	generatePluginIds,
	generatePlugins,
} from "./docusaurusUtils";

const config: Config = {
	title: "Grimoire",
	tagline: "Dinosaurs are cool",
	favicon: "img/favicon.ico",
	future: {
		v4: true,
	},
	url: "https://grimoire.arckate.com",
	baseUrl: "/",
	organizationName: "arckate",
	projectName: "grimoire",

	onBrokenLinks: "throw",
	i18n,

	presets: [
		[
			"classic",
			{
				theme: {
					customCss: require.resolve("./src/css/custom.css"),
				},
				docs: false,
				blog: false,
			} satisfies Preset.Options,
		],
	],
	plugins: [
		[
			"@docusaurus/plugin-content-docs",
			{
				id: "default",
				path: "src/docs",
				routeBasePath: "src/docs",
				sidebarCollapsed: false,
			},
		],
		...generatePlugins({
			versions: tag.versions,
			locales: i18n.locales,
			docs,
		}),
		[
			"@orama/plugin-docusaurus-v3",
			{
				searchBox: true,
				schema: {
					title: "string",
					path: "string",
					content: "string",
				},
				docsPluginIds: [
					...generatePluginIds({
						versions: tag.versions,
						locales: i18n.locales,
						docs,
					}),
				],
				pagesPluginIds: ["pages"],
			},
		],
	],

	themeConfig: {
		image: "img/arckate-grimoire-displayGH.png",
		colorMode: {
			defaultMode: "light",
			disableSwitch: false,
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "Arckate",
			logo: {
				alt: "Arckate Logo",
				src: "img/arckateLogo.svg",
			},
			items: [
				{
					to: "home",
					label: "Home",
					position: "right",
				},
				...generateItemsDocs(docs),
				{
					to: "versionDropdown",
					label: "versionDropdown",
					position: "right",
				},
				{ type: "localeDropdown", position: "right" },
				{ type: "search", position: "right" },
				{
					href: "https://github.com/Arckate/grimoire",
					label: "github",
					position: "right",
				},
			],
		},
		footer: {
			links: [
				{
					title: "Docs",
					items: generateItemsFooterDocs(docs),
				},
				{
					title: "Community",
					items: [
						{
							label: "GitHub",
							href: "https://github.com/Arckate/grimoire",
						},
					],
				},
				{
					title: "Legals",
					items: [
						{
							label: "Credits",
							to: "/credits",
						},
					],
				},
			],
			copyright: "copyright",
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
