import useBaseUrl from "@docusaurus/useBaseUrl";
import { modifyToKey } from "@site/src/contexts/I18n/utils/modifyToKey";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import NavbarItem from "@theme/NavbarItem";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface HomeNavbarItemProps {
	label: string;
	position: "left" | "right";
	onClick?: () => void;
	mobile?: boolean;
}

export default function HomeNavbarItem({
	label,
	position,
	onClick,
	mobile = false,
}: HomeNavbarItemProps): ReactNode {
	const baseUrl = useBaseUrl(`/`);
	const { locale } = useLocale();
	const { version } = useVersion();
	const propsChild = {
		...(onClick ? { onClick } : {}),
	};
	const { t } = useTranslation("navbar", { keyPrefix: "links" });

	return (
		<NavbarItem
			mobile={mobile}
			{...propsChild}
			label={t(modifyToKey(label), { defaultValue: label })}
			position={position}
			href={`${baseUrl}${version}/${locale}`}
		/>
	);
}
