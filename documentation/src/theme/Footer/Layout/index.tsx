import { ThemeClassNames } from "@docusaurus/theme-common";
import type { Props } from "@theme/Footer/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

export default function FooterLayout({
	style,
	links,
	logo,
	copyright,
}: Props): ReactNode {
	return (
		<footer
			className={clsx(ThemeClassNames.layout.footer.container, "footer", {
				"footer--dark": style === "dark",
			})}
		>
			<div className="container container-fluid">
				{links}
				{(logo || copyright) && (
					<div className="footer__bottom text--center">
						{logo && <div className="margin-bottom--sm">{logo}</div>}
						{copyright}
					</div>
				)}
			</div>
		</footer>
	);
}
