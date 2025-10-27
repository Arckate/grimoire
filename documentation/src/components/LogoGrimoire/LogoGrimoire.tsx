import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./styles.module.css";

const LogoGrimoire: React.FC<PropsWithChildren> = ({
	logoSrc,
	name,
	children,
}) => {
	return (
		<div className={clsx(styles.logo)}>
			{logoSrc && <img src={logoSrc} alt={`${name} logo`} />}
			<div className={clsx(styles.logoText)}>{children}</div>
		</div>
	);
};
export default LogoGrimoire;
