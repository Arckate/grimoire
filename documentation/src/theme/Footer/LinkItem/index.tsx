import isInternalUrl from "@docusaurus/isInternalUrl";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import type { Props } from "@theme/Footer/LinkItem";
import IconExternalLink from "@theme/Icon/ExternalLink";
import clsx from "clsx";
import type { ReactNode } from "react";

export default function FooterLinkItem({ item }: Props): ReactNode {
	const { to, href, label, prependBaseUrlToHref, className, ...props } = item;
	const toUrl = useBaseUrl(to);
	const { locale } = useLocale();
	const { version } = useVersion();
	const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });

	return (
		<Link
			className={clsx("footer__link-item", className)}
			{...(href
				? {
						href: prependBaseUrlToHref ? normalizedHref : href,
					}
				: {
						to: `${toUrl}/${version}/${locale}`,
					})}
			{...props}
		>
			{label}
			{href && !isInternalUrl(href) && <IconExternalLink />}
		</Link>
	);
}
