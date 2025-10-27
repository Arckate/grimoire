import {
	type AnyOrama,
	type Orama,
	search as oramaSearchFn,
	type Results,
	type SearchParams,
} from "@orama/orama";
import { type Ref, useCallback, useEffect, useRef, useState } from "react";

export interface Doc {
	title: string;
	content: string;
	path: string;
	section: string;
	version: string;
	category: string;
}

export type Search = (
	params: SearchParams<AnyOrama<Doc>>,
) => Promise<Partial<Results<Doc>>>;

interface UseOrama {
	oramaRef: Ref<HTMLDivElement | null>;
	search: Search;
	isLoading: boolean;
	orama: Orama<Doc>;
}

export const useOrama = (): UseOrama => {
	const [orama, setOrama] = useState<AnyOrama<Doc>>({});
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const oramaRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (oramaRef) {
			const container = oramaRef.current;
			if (!container) return;

			const initialize = async () => {
				await customElements.whenDefined("orama-search-box");

				const checkInstance = () => {
					const oramaBox = container.querySelector("orama-search-box") as any;

					const inst = oramaBox?.clientInstance || oramaBox?.instance;

					if (inst) {
						setOrama(inst);
						setIsLoading(false);
					} else {
						setTimeout(checkInstance, 50);
					}
				};

				checkInstance();
			};

			initialize();
		}
	}, [oramaRef]);

	const search = useCallback(
		async (
			params: SearchParams<AnyOrama<Doc>>,
		): Promise<Partial<Results<Doc>>> => {
			if (!orama) return {};
			return await oramaSearchFn(orama, params);
		},
		[orama],
	);

	return { oramaRef, search, isLoading, orama };
};
