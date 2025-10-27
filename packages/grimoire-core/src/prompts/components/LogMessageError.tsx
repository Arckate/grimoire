import { Box, Text } from "ink";

interface LogMessageErrorProps {
	error: Error;
}

const LogMessageError: React.FC<LogMessageErrorProps> = ({ error }) => (
	<Box gap={1}>
		<Text backgroundColor="red" bold>
			{error.name}
		</Text>
		<Text color="red">{error.message}</Text>
	</Box>
);

export default LogMessageError;
