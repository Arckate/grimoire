import { Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { useEffect, useMemo, useState } from "react";
import { HighlightText } from "./HighlightText";
import InvalidMessage from "./InvalidMessage";
import ReturnMessage from "./ReturnMessage";

interface SearchItem {
	label: string;
	value: string;
	description?: string;
}

interface SearchProps {
	message: string;
	list: SearchItem[];
	onSubmit: (value: string) => void;
	isValidSelectedValue?: boolean;
	selectedValue?: string;
	invalid?: {
		icon?: string;
		prefix?: string;
		suffix?: string;
		message?: string;
	};
	down?: {
		icon?: string;
		prefix?: string;
		suffix?: string;
	};
	indicator?: {
		icon?: string;
		color?: string;
	};
	isExited?: boolean;
}

const Search: React.FC<SearchProps> = ({
	message,
	isValidSelectedValue,
	selectedValue,
	list,
	invalid,
	down = {},
	indicator = {},
	onSubmit,
	isExited = false,
}) => {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string | null>(null);
	const { exit } = useApp();

	const items = list.filter(
		(item) => !query || item.label.toLowerCase().includes(query.toLowerCase()),
	);

	const indicatorComponent = ({ isSelected }: { isSelected: boolean }) => (
		<Text color={indicator.color || "cyanBright"}>
			{isSelected ? `${indicator.icon || "❯"} ` : "  "}
		</Text>
	);

	const itemComponent = useMemo(() => {
		const descMap = new Map(list.map((item) => [item.label, item.description]));
		return ({ label, isSelected }: { label: string; isSelected: boolean }) => {
			const description = descMap.get(label);
			return isSelected ? (
				<Text color="cyanBright">
					<HighlightText text={label} word={query} />
					{description && <Text dimColor> - {description}</Text>}
				</Text>
			) : (
				<Text>
					<HighlightText text={label} word={query} />
					{description && <Text dimColor> - {description}</Text>}
				</Text>
			);
		};
	}, [query, list]);

	useEffect(() => {
		if (selected !== null) {
			onSubmit(selected);
			isExited && exit();
		}
	}, [selected]);

	useEffect(() => {
		if (selectedValue && isValidSelectedValue) {
			onSubmit(selected);
			isExited && exit();
		}
	}, [selectedValue, isValidSelectedValue]);

	if (selected !== null || (selectedValue && isValidSelectedValue)) {
		return (
			<ReturnMessage
				prefix={down.prefix}
				suffix={down.suffix}
				value={selected || selectedValue}
				icon={down.icon}
				query={query}
			/>
		);
	}

	const isInValid = isValidSelectedValue === false &&
				Boolean(selectedValue) &&
				Boolean(invalid)

	return (
		<Box flexDirection="column">
			{ isInValid && (
					<InvalidMessage
						prefix={invalid.prefix}
						suffix={invalid.suffix}
						value={selectedValue}
						icon={invalid.icon}
					/>
				)}
			<Box>
				<Text color="blue">? </Text>
				<Text bold>{ isInValid ?(invalid.message || message): message } </Text>
				<Text color="cyanBright">
					<TextInput value={query} onChange={setQuery} />
				</Text>
			</Box>
			{items.length ? (
				<SelectInput
					items={items}
					limit={7}
					itemComponent={itemComponent}
					indicatorComponent={indicatorComponent}
					onSelect={({ value }) => setSelected(value)}
				/>
			) : (
				<Text color="red">&gt; No results found</Text>
			)}
			<Box marginTop={1}>
				<Text>↑↓ </Text>
				<Text dimColor>navigate • </Text>
				<Text>⏎ </Text>
				<Text dimColor>select</Text>
			</Box>
		</Box>
	);
};

export default Search;
