import { useHistory, useLocation } from "@docusaurus/router";
import { tag } from "@site/docusaurusConfig";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type VersionContextType = {
	version: string;
	setVersion: (newLocale: string) => void;
};

const VersionContext = createContext<VersionContextType>({
	version: "",
	setVersion: () => {},
});

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	tag;
	const { versions, defaultVersion } = tag;
	const { pathname } = useLocation();
	const history = useHistory();
	const [version, setVersion] = useState(defaultVersion);

	const setMyVersion = (newVersion: string) => {
		if (newVersion === version) return;
		const pathArray = pathname.split("/").filter((v) => Boolean(v));
		const newPath = `/${pathArray
			.map((value) => {
				if (value === version) {
					return newVersion;
				}
				return value;
			})
			.join("/")}`;

		setVersion(newVersion);
		history.push(newPath);
	};

	useEffect(() => {
		const pathArray = pathname.split("/").filter((v) => Boolean(v));
		const candidate = pathArray.filter((value) => versions.includes(value));
		const current = candidate.length === 1 ? candidate[0] : defaultVersion;
		if (current !== version) {
			setVersion(current);
		}
	}, [pathname]);

	return (
		<VersionContext.Provider value={{ version, setVersion: setMyVersion }}>
			{children}
		</VersionContext.Provider>
	);
};

export const useVersion = () => useContext(VersionContext);
