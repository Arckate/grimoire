import type { WrapperProps } from "@docusaurus/types";
import { DocProvider } from "@site/src/contexts/docContext";
import I18nSetup from "@site/src/contexts/I18n/I18nSetup";
import { LocaleProvider } from "@site/src/contexts/LocaleContext";
import { VersionProvider } from "@site/src/contexts/VersionContext";
import type LayoutType from "@theme/Layout";
import Layout from "@theme-original/Layout";
import type { ReactNode } from "react";

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): ReactNode {
	return (
		<I18nSetup>
			<VersionProvider>
				<LocaleProvider>
					<DocProvider>
						<Layout {...props} />
					</DocProvider>
				</LocaleProvider>
			</VersionProvider>
		</I18nSetup>
	);
}
