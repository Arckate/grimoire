import clsx from "clsx";
import type { PropsWithChildren } from "react";
import SectionActionBg from "./components/SectionActionBg";
import { paths } from "./paths";
import styles from "./styles.module.css";

const SectionAction: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<section className={clsx(styles.sectionAction)}>
			<SectionActionBg paths={paths} />
			<div className="container">
				<div className="container_bg">{children}</div>
			</div>
		</section>
	);
};
export default SectionAction;
