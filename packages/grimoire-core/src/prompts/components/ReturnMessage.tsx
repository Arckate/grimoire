import { Box, Text } from "ink";
import { HighlightText } from "./HighlightText";

interface ReturnMessageProps {
	value: string;
	prefix?: string;
	suffix?: string;
	icon?: string;
	query?: string;
}

const ReturnMessage: React.FC<ReturnMessageProps> = ({
	prefix,
	suffix,
	value,
	icon,
	query = "",
}) => (
	<Box>
		<Text color="green">{icon ? `${icon} ` : "✔ "}</Text>
		{Boolean(prefix) && <Text bold>{prefix}</Text>}
		<Text color="cyanBright">
			<HighlightText text={value} word={query} />
		</Text>
		{Boolean(suffix) && <Text bold>{suffix}</Text>}
	</Box>
);

export default ReturnMessage;
