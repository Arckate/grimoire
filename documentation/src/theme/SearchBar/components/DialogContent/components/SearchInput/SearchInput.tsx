import { Close } from "@radix-ui/react-dialog";
import clsx from "clsx";
import type { ChangeEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { MdClose, MdSearch } from "react-icons/md";
import { paths } from "./components/SearchBg/paths";
import SearchBg from "./components/SearchBg/SearchBg";
import styles from "./styles.module.css";

interface SearchInputProps {
	handleChange: (e: ChangeEventHandler<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ handleChange }) => {
	const { t } = useTranslation("search");

	return (
		<div className={clsx(styles.searchbar)}>
			<SearchBg paths={paths} scale={0.4} />
			<div className={clsx(styles.elementsSearchbar)}>
				<div className={clsx(styles.input)}>
					<MdSearch className="icon" />{" "}
					<input
						type="text"
						placeholder={t("placeholder", { defaultValue: "Search..." })}
						className="input"
						onChange={(e) => {
							handleChange(e);
						}}
					/>
				</div>
				<Close className="button button--secondary close-button">
					<MdClose className="closeIcon" />
				</Close>
			</div>
		</div>
	);
};

export default SearchInput;
