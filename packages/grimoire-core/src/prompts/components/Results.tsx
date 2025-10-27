import { Box, Text } from "ink";

export type PromptResultItem =
	| { isValid: true; data: { type: string; name: string; value?: unknown } }
	| { isValid: false; data: { message: string } };

interface PromptResultProps {
	items: PromptResultItem[];
}

const Results: React.FC<PromptResultProps> = ({ items }) => (
	<Box flexDirection="column">
		{items.map((item) =>
			item.isValid === false ? (
				<Box key={crypto.randomUUID()} gap={1}>
					<Text color="red">✖</Text>
					<Text color="red">{item.data.message}</Text>
				</Box>
			):(
				<Box key={crypto.randomUUID()} gap={1}>
					<Text color="green">✔</Text>
					<Text color="blueBright" bold italic>
						[{item.data.type}]
					</Text>
					<Text>{String(item.data.value ?? item.data.name)}</Text>
				</Box>
			)
		)}
	</Box>
);

export default Results;
