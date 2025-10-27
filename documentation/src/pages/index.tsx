import { Redirect } from "@docusaurus/router";
import { i18n, tag } from "@site/docusaurusConfig";

export default function Home() {
	const locale = i18n.defaultLocale;
	const version = tag.defaultVersion;
	return <Redirect to={`/${version}/${locale}`} />;
}
