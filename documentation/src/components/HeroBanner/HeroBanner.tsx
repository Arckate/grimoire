import clsx from "clsx";
import type { PropsWithChildren } from "react";
import HeroBannerBg from "./components/HeroBannerBg";
import { paths } from "./paths";
import styles from "./styles.module.css";

const HeroBanner: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<section className={clsx(styles.hero)}>
			<div className={clsx(styles.heroBg)}>
				<HeroBannerBg paths={paths} />
			</div>
			<div className={clsx(styles.heroContainer)}>
				<div className={clsx(styles.content)}>{children}</div>
			</div>
		</section>
	);
};
export default HeroBanner;
