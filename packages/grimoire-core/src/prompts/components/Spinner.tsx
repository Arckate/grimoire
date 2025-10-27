import InkSpinner from "ink-spinner";
import { Text } from "ink";

interface SpinnerProps {
	text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text = "Loading" }) => (
	<Text>
		<Text color="green">
			<InkSpinner type="dots" />
		</Text>
		{"  "}
		{text}
	</Text>
);

export default Spinner;
