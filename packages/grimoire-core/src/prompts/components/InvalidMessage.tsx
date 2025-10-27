import { Box, Text } from "ink";

interface InvalidMessageProps {
	value: string;
	prefix?: string;
	suffix?: string;
	icon?: string;
	query?: string;
}

const InvalidMessage: React.FC<InvalidMessageProps> = ({
	prefix,
	suffix,
	value,
	icon,
}) => (
	<Box>
		<Text bold color="yellow">
			{icon ? `${icon} ` : "⚠ "}
		</Text>
		{Boolean(prefix) && <Text color="yellow">{prefix}</Text>}
		<Text color="cyanBright">{value}</Text>
		{Boolean(suffix) && <Text color="yellow">{suffix}</Text>}
	</Box>
);

export default InvalidMessage;
