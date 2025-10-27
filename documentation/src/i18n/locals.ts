// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)

import footerEn from "./en/footer";
import navBarEn from "./en/navBar";
import searchEn from "./en/search";

import footerFr from "./fr/footer";
import navBarFr from "./fr/navBar";
import searchFr from "./fr/search";

export const resources = {
	en: {
		...searchEn,
		...navBarEn,
		...footerEn,
	},
	fr: {
		...searchFr,
		...navBarFr,
		...footerFr,
	},
} as const;
