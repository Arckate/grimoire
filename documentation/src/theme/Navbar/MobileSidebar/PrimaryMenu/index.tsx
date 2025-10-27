import { useThemeConfig } from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocale } from "@site/src/contexts/LocaleContext";
import { useVersion } from "@site/src/contexts/VersionContext";
import NavbarItem, { type Props as NavbarItemConfig } from "@theme/NavbarItem";
import { Fragment, type ReactNode } from "react";
import HomeNavbarItem from "../../HomeNavbarItem";
import LocaleDropdown from "../../LocaleDropdown";
import VersionDropdown from "../../VersionDropdown";

function useNavbarItems() {
	// TODO temporary casting until ThemeConfig type is improved
	return useThemeConfig().navbar.items as NavbarItemConfig[];
}

// The primary menu displays the navbar items
export default function NavbarMobilePrimaryMenu(): ReactNode {
	const mobileSidebar = useNavbarMobileSidebar();

	// TODO how can the order be defined for mobile?
	// Should we allow providing a different list of items?
	const items = useNavbarItems();
	const baseUrl = useBaseUrl(`/`);
	const { locale } = useLocale();
	const { version } = useVersion();

	return (
		<ul className="menu__list">
			{items.map((item) => (
				<Fragment key={crypto.randomUUID()}>
					{((inItem) => {
						if ((inItem as any).to === "home")
							return (
								<HomeNavbarItem
									mobile
									label={(inItem as any).label}
									position={(inItem as any).position}
									onClick={() => mobileSidebar.toggle()}
								/>
							);
						if ((inItem as any).to === "versionDropdown")
							return (
								<VersionDropdown
									mobile
									onClick={() => mobileSidebar.toggle()}
								/>
							);
						if (inItem.type === "localeDropdown")
							return (
								<LocaleDropdown mobile onClick={() => mobileSidebar.toggle()} />
							);
						if (inItem.type === "search") return;
						if ((inItem as any).to) {
							return (
								<NavbarItem
									mobile
									{...inItem}
									onClick={() => mobileSidebar.toggle()}
									href={`${baseUrl}${(item as any).to}/${version}/${locale}`}
								/>
							);
						}

						return <NavbarItem {...inItem} />;
					})(item)}
				</Fragment>
			))}
		</ul>
	);
}
