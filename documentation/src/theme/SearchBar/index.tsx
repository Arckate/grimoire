import type { WrapperProps } from "@docusaurus/types";
import {
	Content,
	Description,
	Dialog,
	Overlay,
	Portal,
	Title,
	Trigger,
} from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type SearchBarType from "@theme/SearchBar";
import OramaSearchBar from "@theme-original/SearchBar";
import clsx from "clsx";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdSearch } from "react-icons/md";
import DialogContent from "./components/DialogContent/DialogContent";
import { useOrama } from "./hooks/useOrama";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof SearchBarType>;

export default function SearchBarWrapper(props: Props): ReactNode {
	const [open, setOpen] = useState(false);
	const { isLoading, oramaRef, search } = useOrama();
	const { t } = useTranslation("search");

	const onOpen = (openChange: boolean) => {
		setOpen(openChange);
	};

	return (
		<div className={styles.searchContainer}>
			<div ref={oramaRef} style={{ display: "none" }}>
				<OramaSearchBar {...props} />
			</div>

			<Dialog onOpenChange={onOpen} open={open}>
				<Trigger asChild>
					<button
						type="button"
						disabled={isLoading}
						className={clsx(
							styles.mySearchButton,
							" button button--outline button--secondary",
						)}
					>
						<MdSearch />
						<span>{t("button", { defaultValue: "Search..." })}</span>
					</button>
				</Trigger>
				<Portal>
					<Overlay />
					<Content
						className={clsx(styles.contentDialog)}
						onClick={() => setOpen(false)}
					>
						<VisuallyHidden asChild>
							<Title> Hidden </Title>
						</VisuallyHidden>
						<VisuallyHidden asChild>
							<Description>Fixed the warning</Description>
						</VisuallyHidden>
						<DialogContent search={search} />
					</Content>
				</Portal>
			</Dialog>
		</div>
	);
}
