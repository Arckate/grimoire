import { ThemeClassNames } from "@docusaurus/theme-common";
import { modifyToKey } from "@site/src/contexts/I18n/utils/modifyToKey";
import LinkItem from "@theme/Footer/LinkItem";
import type { Props } from "@theme/Footer/Links/MultiColumn";
import clsx from "clsx";
import React, { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

type ColumnType = Props["columns"][number];
type ColumnItemType = ColumnType["items"][number];

function ColumnLinkItem({ item }: { item: ColumnItemType }) {
	return item.html ? (
		<li
			className={clsx("footer__item", item.className)}
			// Developer provided the HTML, so assume it's safe.
			// eslint-disable-next-line react/no-danger
			angerouslySetInnerHTML={{ __html: item.html }}
		/>
	) : (
		<li key={item.href ?? item.to} className="footer__item">
			<LinkItem item={item} />
		</li>
	);
}

function Column({ column }: { column: ColumnType }) {
	const { t } = useTranslation("footer");
	return (
		<div
			className={clsx(
				ThemeClassNames.layout.footer.column,
				"col footer__col",
				column.className,
			)}
		>
			<div className="footer__title">
				{t(`${modifyToKey(column.title)}.title`, {
					defaultValue: column.title,
				})}
			</div>
			<ul className="footer__items clean-list">
				{column.items.map(({ label, ...itemValue }) => {
					const item = {
						...itemValue,
						label: t(`${modifyToKey(column.title)}.${modifyToKey(label)}`, {
							defaultValue: label,
						}),
					};
					return (
						<React.Fragment key={crypto.randomUUID()}>
							<ColumnLinkItem item={item} />
						</React.Fragment>
					);
				})}
			</ul>
		</div>
	);
}

export default function FooterLinksMultiColumn({ columns }: Props): ReactNode {
	return (
		<div className="row footer__links">
			{columns.map((column) => (
				<React.Fragment key={crypto.randomUUID()}>
					<Column column={column} />
				</React.Fragment>
			))}
		</div>
	);
}
