import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { tag } from "@site/docusaurusConfig";
import { useVersion } from "@site/src/contexts/VersionContext";
import clsx from "clsx";
import { useState } from "react";
import { CgStack } from "react-icons/cg";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import styles from "./styles.module.css";

interface VersionDropdownProps {
	mobile?: boolean;
	onClick?: () => void;
}

const VersionDropdown = ({ mobile = false, onClick }: VersionDropdownProps) => {
	const { shouldRender } = useNavbarMobileSidebar();

	const { versions, versionConfigs } = tag;
	const { version, setVersion } = useVersion();

	const [isOpen, setIsOpen] = useState(false);
	const toggleIsOpen = () => {
		setIsOpen((v) => !v);
	};

	if (shouldRender && !mobile) {
		return;
	}

	const label = versionConfigs?.[version]?.label ?? version;
	return (
		<DropdownMenu onOpenChange={toggleIsOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={clsx(styles.center, styles.button, mobile ? "mobile" : "")}
				>
					<CgStack className={clsx(styles.space)} />
					{label}
					{!isOpen && <MdArrowDropDown />}
					{isOpen && <MdArrowDropUp />}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className={clsx(styles.menuContent, mobile ? "mobile" : "")}
				align={mobile ? "start" : "end"}
			>
				{versions.map((ver) => (
					<DropdownMenuItem
						key={ver}
						className={clsx(
							styles.item,
							ver === version ? styles.itemActive : "",
						)}
						onClick={() => {
							setVersion(ver);
							if (onClick) {
								onClick();
							}
						}}
					>
						{versionConfigs?.[ver]?.label ?? ver}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default VersionDropdown;
