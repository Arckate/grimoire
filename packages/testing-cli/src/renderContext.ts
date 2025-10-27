interface CommandContext {
	stdout: any;
	delay: number;
}

interface RenderContext {
	[x: string]: CommandContext;
}

const context: RenderContext = {};

export const createRenderContext = (
	seed: string,
	newContext: CommandContext,
): void => {
	context[seed] = newContext;
};

export const getRenderContext = (
	seed: string,
):
	| CommandContext
	| {
			stdout: null;
			delay: 100;
	  } =>
	context[seed] || {
		stdout: null,
		delay: 100,
	};

export const getStdout = (seed: string): any => context[seed]?.stdout || null;

export const getDelay = (seed: string): number => context[seed]?.delay || 100;

export const cleanRenderContext = (seed: string): void => {
	delete context[seed];
};
