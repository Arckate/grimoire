export interface Doc {
	id: string;
	path: string;
	toPath: string;
	label: string;
	position: "right" | "left";
}

export type Docs = Record<string, Doc>;

export const docs: Docs = {
	cli: {
		id: "cli",
		path: "../packages/grimoire-cli/docs",
		toPath: "cli",
		label: "CLI",
		position: "right",
	},
	core: {
		id: "core",
		path: "../packages/grimoire-core/docs",
		toPath: "core",
		label: "Core",
		position: "right",
	},
	test: {
		id: "test",
		path: "../packages/testing-cli/docs",
		toPath: "test",
		label: "Test",
		position: "right",
	},
};

export const i18n = {
	defaultLocale: "fr",
	locales: ["en", "fr"],
	localeConfigs: {
		en: { label: "EN" },
		fr: { label: "FR" },
	},
};

export const tag = {
	defaultVersion: "V0",
	versions: ["V0", "V1"],
	versionConfigs: {
		V0: { label: "v0.X.X" },
		V1: { label: "v1.X.X" },
	},
};
