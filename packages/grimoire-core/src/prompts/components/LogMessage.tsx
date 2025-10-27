import { Text } from "ink";

interface LogMessageProps {
	args: (string | object)[];
}

const LogMessage: React.FC<LogMessageProps> = ({ args }) => {
	const formatted = args
		.map((arg) =>
			typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg,
		)
		.join(" ");

	return <Text>{formatted}</Text>;
};

export default LogMessage;
