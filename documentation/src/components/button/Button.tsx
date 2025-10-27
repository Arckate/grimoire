import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import type { PropsWithChildren } from "react";

interface ButtonProps {
	href?: string;
	to?: string;
	className?: string;
}

const Button: React.FC<PropsWithChildren<ButtonProps>> = ({
	href = "#",
	to,
	className = "button--primary",
	children,
}) => {
	const baseUrl = useBaseUrl(to ? `/${to}` : `/`);
	const { locale } = useLocale();
	const { version } = useVersion();

	const getTo = (to: string, href: string) =>
		to ? `${baseUrl}/${version}/${locale}` : href;

	return (
		<Link to={getTo(to, href)} className={`button ${className}`}>
			{children}
		</Link>
	);
};

export default Button;
