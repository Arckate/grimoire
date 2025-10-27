import type { Props } from "@theme/Navbar/Search";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./styles.module.css";

export default function NavbarSearch({
	children,
	className,
}: Props): ReactNode {
	return (
		<div className={clsx(className, styles.navbarSearchContainer)}>
			{children}
		</div>
	);
}
