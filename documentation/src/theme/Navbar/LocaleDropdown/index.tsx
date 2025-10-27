import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { i18n as i18nConfig } from "@site/docusaurusConfig";
import { useLocale } from "@site/src/contexts/LocaleContext";
import IconLanguage from "@theme/Icon/Language";
import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import styles from "./styles.module.css";

interface LocaleDropdownProps {
	mobile?: boolean;
	onClick?: () => void;
}

const LocaleDropdown = ({ mobile = false, onClick }: LocaleDropdownProps) => {
	const { shouldRender } = useNavbarMobileSidebar();

	const { locales, localeConfigs } = i18nConfig;
	const { i18n } = useTranslation();

	const { locale, setLocale } = useLocale();

	const [isOpen, setIsOpen] = useState(false);
	const toggleIsOpen = () => {
		setIsOpen((v) => !v);
	};

	if (shouldRender && !mobile) {
		return;
	}

	const label = localeConfigs?.[locale]?.label ?? locale;
	return (
		<DropdownMenu onOpenChange={toggleIsOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={clsx(styles.center, styles.button, mobile ? "mobile" : "")}
				>
					<IconLanguage className={clsx(styles.space)} />
					{label}
					{!isOpen && <MdArrowDropDown />}
					{isOpen && <MdArrowDropUp />}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className={clsx(styles.menuContent, mobile ? "mobile" : "")}
				align={mobile ? "start" : "end"}
			>
				{locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						className={clsx(
							styles.item,
							loc === locale ? styles.itemActive : "",
						)}
						onClick={() => {
							setLocale(loc);
							i18n.changeLanguage(loc);
							if (onClick) {
								onClick();
							}
						}}
					>
						{localeConfigs?.[loc]?.label ?? loc}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LocaleDropdown;
