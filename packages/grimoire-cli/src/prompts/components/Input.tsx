import { Box, Text, useApp } from "ink";
import TextInput from "ink-text-input";
import { useEffect, useState } from "react";

interface InputProps {
	message: string;
	onSubmit: (value: string) => void;
	isExited?: boolean;
	prefixDone?: string;
}

const Input: React.FC<InputProps> = ({
	message,
	onSubmit,
	prefixDone,
	isExited = false,
}) => {
	const [value, setValue] = useState("");
	const [submitted, setSubmitted] = useState<string | null>(null);
	const { exit } = useApp();

	useEffect(() => {
		if (submitted !== null) {
			onSubmit(submitted);
			isExited && exit();
		}
	}, [submitted]);

	if (submitted !== null) {
		return (
			<Box>
				<Text color="green"> {prefixDone ? `${prefixDone} ` : "✔ "}</Text>
				<Text bold>{message} </Text>
				<Text color="cyanBright">{submitted}</Text>
			</Box>
		);
	}

	return (
		<Box>
			<Text color="blue">? </Text>
			<Text bold>{message} </Text>
			<TextInput value={value} onChange={setValue} onSubmit={setSubmitted} />
		</Box>
	);
};

export default Input;
