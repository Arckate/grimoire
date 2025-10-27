import { ROOTS } from "./roots";
import { SKIP_PARAMS_KEY } from "./skippedParams";

export const REG_CMD_OPTION_VALUE = /(<[^>]+>)/g;
export const REG_CMD_SKIP_PARAMS_KEY = new RegExp(`^${SKIP_PARAMS_KEY}`);

export const REG_IS_ROOTS_PARENT = new RegExp(`^${ROOTS.PARENT}/`);
export const REG_IS_ROOTS_ROOT = new RegExp(`^${ROOTS.ROOT}/`);

export const REG_IS_DIRS = /\[[^\]]+\]/;
