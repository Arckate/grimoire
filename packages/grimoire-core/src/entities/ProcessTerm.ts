export interface ProcessTerm {
	stdin: typeof process.stdin;
	stderr: typeof process.stderr;
	stdout: typeof process.stdout;
	exit: typeof process.exit;
}
