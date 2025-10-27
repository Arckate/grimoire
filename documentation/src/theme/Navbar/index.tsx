import NavbarContent from "@theme/Navbar/Content";
import NavbarLayout from "@theme/Navbar/Layout";
import type { ReactNode } from "react";

export default function Navbar(): ReactNode {
	return (
		<NavbarLayout>
			<NavbarContent />
		</NavbarLayout>
	);
}
