import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./styles.module.css";

const Section: React.FC<PropsWithChildren> = ({ children, className = "" }) => {
	return (
		<section className={clsx(styles.section, className)}>{children}</section>
	);
};
export default Section;
