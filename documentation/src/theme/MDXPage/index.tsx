import { useLocation } from "@docusaurus/router";
import {
	HtmlClassNameProvider,
	PageMetadata,
	ThemeClassNames,
} from "@docusaurus/theme-common";
import ContentVisibility from "@theme/ContentVisibility";
import EditMetaRow from "@theme/EditMetaRow";
import Layout from "@theme/Layout";
import MDXContent from "@theme/MDXContent";
import type { Props } from "@theme/MDXPage";
import TOC from "@theme/TOC";
import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

export default function MDXPage(props: Props): ReactNode {
	const location = useLocation();
	const isHome =
		location.pathname.split("/").filter((path) => path).length === 2;
	const { content: MDXPageContent } = props;
	const { metadata, assets } = MDXPageContent;
	const {
		title,
		editUrl,
		description,
		frontMatter,
		lastUpdatedBy,
		lastUpdatedAt,
	} = metadata;
	const {
		keywords,
		wrapperClassName,
		hide_table_of_contents: hideTableOfContents,
	} = frontMatter;
	const image = assets.image ?? frontMatter.image;

	const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy);

	return (
		<HtmlClassNameProvider
			className={clsx(
				wrapperClassName ?? ThemeClassNames.wrapper.mdxPages,
				ThemeClassNames.page.mdxPage,
			)}
		>
			<Layout>
				<PageMetadata
					title={title}
					description={description}
					keywords={keywords}
					image={image}
				/>
				<main
					className={
						!isHome
							? clsx("container", "container--fluid", "margin-vert--lg")
							: ""
					}
				>
					<div className={!isHome ? clsx("row", styles.mdxPageWrapper) : ""}>
						<div
							className={
								!isHome ? clsx("col", !hideTableOfContents && "col--8") : ""
							}
						>
							<ContentVisibility metadata={metadata} />
							<article>
								<MDXContent>
									<MDXPageContent />
								</MDXContent>
							</article>
							{canDisplayEditMetaRow && (
								<EditMetaRow
									className={clsx(
										"margin-top--sm",
										ThemeClassNames.pages.pageFooterEditMetaRow,
									)}
									editUrl={editUrl}
									lastUpdatedAt={lastUpdatedAt}
									lastUpdatedBy={lastUpdatedBy}
								/>
							)}
						</div>
						{!hideTableOfContents && MDXPageContent.toc.length > 0 && (
							<div className="col col--2">
								<TOC
									toc={MDXPageContent.toc}
									minHeadingLevel={frontMatter.toc_min_heading_level}
									maxHeadingLevel={frontMatter.toc_max_heading_level}
								/>
							</div>
						)}
					</div>
				</main>
			</Layout>
		</HtmlClassNameProvider>
	);
}
