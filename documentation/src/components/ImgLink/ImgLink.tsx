import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./styles.module.css";

interface ImgLinkProps {
	href: string;
	className?: string;
}

const ImgLink: React.FC<PropsWithChildren<ImgLinkProps>> = ({
	href = "#",
	className = "",
	children,
}) => {
	return (
		<a href={href} target="_blank" className={clsx(styles.imgLink, className)}>
			{children}
		</a>
	);
};

export default ImgLink;
