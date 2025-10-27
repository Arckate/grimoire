import { useLocation } from "@docusaurus/router";
import { docs as docsConfig } from "@site/docusaurusConfig";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type DocsContextType = {
	doc: string;
};

const DocsContext = createContext<DocsContextType>({
	doc: "",
});

export const DocProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { pathname } = useLocation();
	const [doc, setDoc] = useState("");

	useEffect(() => {
		const pathArray = pathname.split("/").filter((v) => Boolean(v));
		const candidate = pathArray.filter((value) =>
			Object.values(docsConfig)
				.map(({ id }) => id)
				.includes(value),
		);
		const current = candidate.length === 1 ? candidate[0] : "";
		if (current) {
			setDoc(current);
		}
	}, [pathname]);

	return (
		<DocsContext.Provider value={{ doc }}>{children}</DocsContext.Provider>
	);
};

export const useDoc = () => useContext(DocsContext);
