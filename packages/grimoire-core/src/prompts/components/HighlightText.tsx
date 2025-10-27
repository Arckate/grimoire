import { Text } from "ink";

interface HighlightTextProps {
	text: string;
	word: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, word }) => {
	if (!word) return <Text>{text}</Text>;

	let offset = 0;
	const segments = text.split(new RegExp(`(${word})`, "gi")).map((part) => {
		const segment = {
			key: String(offset),
			part,
			isMatch: part.toLowerCase() === word.toLowerCase(),
		};
		offset += part.length;
		return segment;
	});

	return (
		<Text>
			{segments.map(({ key, part, isMatch }) =>
				isMatch ? (
					<Text key={key} bold>
						{part}
					</Text>
				) : (
					part
				),
			)}
		</Text>
	);
};

export default HighlightText;
