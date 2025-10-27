import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import styles from "./styles.module.css";

export interface Option {
	value: string;
	label: string;
}

interface VersionDropdownProps {
	labelKey: string;
	defaultValues: string[];
	values: Option[];
	handle: (x: string[]) => void;
}

const MultiSelect = ({
	labelKey,
	defaultValues,
	values,
	handle,
}: VersionDropdownProps) => {
	const { t } = useTranslation("search", { keyPrefix: "filters" });

	const constructDefault = (options: string[], initValues: Option[]) =>
		initValues.filter(({ value }) => options.includes(value));

	const handelChange = (newValues: Option[]) => {
		const values = newValues.map<string>(({ value }) => value);
		handle(values);
	};

	return (
		<div className={clsx(styles.multiSelect)}>
			<label htmlFor={labelKey}>
				{t(`${labelKey}.title`, {
					defaultValue: labelKey,
				})}
			</label>
			<Select
				inputId={labelKey}
				defaultValue={constructDefault(defaultValues, values)}
				isMulti
				name={labelKey}
				options={values}
				placeholder={t(`${labelKey}.placeholder`, {
					defaultValue: "Select...",
				})}
				onChange={handelChange}
				className="multi-select"
				classNamePrefix="select"
			/>
		</div>
	);
};

export default MultiSelect;
