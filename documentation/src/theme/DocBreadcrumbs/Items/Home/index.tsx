import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import IconHome from "@theme/Icon/Home";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

export default function HomeBreadcrumbItem(): ReactNode {
	const baseUrl = useBaseUrl("/");
	const { locale } = useLocale();
	const { version } = useVersion();

	return (
		<li className="breadcrumbs__item">
			<Link
				aria-label={translate({
					id: "theme.docs.breadcrumbs.home",
					message: "Home page",
					description: "The ARIA label for the home page in the breadcrumbs",
				})}
				className="breadcrumbs__link"
				href={`${baseUrl}${version}/${locale}`}
			>
				<IconHome className={styles.breadcrumbHomeIcon} />
			</Link>
		</li>
	);
}
