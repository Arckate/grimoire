import { ROOTS } from "~/const/roots";

export interface Roots {
	[ROOTS.PARENT]: string | null;
	[ROOTS.ROOT]: string | null;
}
