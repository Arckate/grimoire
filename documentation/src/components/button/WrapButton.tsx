import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./styles.module.css";

interface ButtonProps {
	href?: string;
	to?: string;
	className?: string;
}

const WrapButton: React.FC<PropsWithChildren<ButtonProps>> = ({
	className = "",
	children,
}) => {
	return <div className={clsx(styles.buttonWrap, className)}>{children}</div>;
};

export default WrapButton;
