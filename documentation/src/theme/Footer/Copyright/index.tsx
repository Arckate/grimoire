import { modifyToKey } from "@site/src/contexts/I18n/utils/modifyToKey";
import type { Props } from "@theme/Footer/Copyright";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export default function FooterCopyright({ copyright }: Props): ReactNode {
	const { t } = useTranslation("footer");
	const currentYear = new Date().getFullYear();
	const copyrightI18n = t(modifyToKey(copyright), {
		defaultValue: copyright,
		date: currentYear,
	});
	return (
		<div
			className="footer__copyright"
			// Developer provided the HTML, so assume it's safe.
			// eslint-disable-next-line react/no-danger
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <so assume it's safe>
			dangerouslySetInnerHTML={{ __html: copyrightI18n }}
		/>
	);
}
