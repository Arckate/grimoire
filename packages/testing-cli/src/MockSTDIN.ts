import { Readable, type ReadableOptions } from "node:stream";

class MockData {
	public readonly data: Buffer | string;
	public readonly encoding: BufferEncoding | null;
	public pos = 0;
	public done = false;

	constructor(chunk: Buffer | string | null, encoding?: BufferEncoding) {
		this.data = chunk ?? "";
		this.encoding = typeof encoding === "string" ? encoding : null;
	}

	get length(): number {
		return Buffer.isBuffer(this.data)
			? this.data.length
			: this.data.toString().length;
	}

	chunk(length: number): string | Buffer | null {
		if (this.pos <= this.length) {
			const value = Buffer.isBuffer(this.data)
				? this.data.subarray(this.pos, this.pos + length)
				: (this.data as string).slice(this.pos, this.pos + length);
			this.pos += length;
			if (this.pos >= this.length) {
				this.done = true;
			}
			return value;
		}
		this.done = true;
		return null;
	}
}

export class MockSTDIN extends Readable {
	private _mockData: MockData[] = [];
	public readonly target: NodeJS.ReadableStream;
	public readonly isMock = true;
	private _logger: any[][] = [];
	private _enableLog = false;

	enableLog(): void {
		this._enableLog = true;
	}

	getLogger(): any[][] {
		return this._logger;
	}

	constructor(restoreTarget: NodeJS.ReadableStream, options?: ReadableOptions) {
		super({ ...options, highWaterMark: 0 });
		this.target = restoreTarget;

		Object.defineProperty(this, "isTTY", {
			value: true,
			writable: false,
			configurable: false,
		});

		(this as any).setRawMode = (bool: boolean) => {
			if (typeof bool !== "boolean")
				throw new TypeError("setRawMode only takes booleans");
		};

		(this as any).ref = () => this;
		(this as any).unref = () => this;
	}

	send(text: string | Buffer | null, encoding?: BufferEncoding): this {
		if (Array.isArray(text)) {
			if (encoding) {
				throw new TypeError("Cannot specify encoding when text is an array");
			}
			text = text.join("\n");
		}
		if (this._enableLog) {
			const display =
				text === null
					? "null"
					: typeof text === "string"
						? text
								.replace(/\r/g, "\\r")
								.replace(/\n/g, "\\n")
								.replace(//g, "\\u001b")
						: `<Buffer ${text.toString("hex")}>`;
			this._logger.push(["send", display]);
		}
		const data = new MockData(text, encoding);
		this._mockData.push(data);
		this._read();
		if (text === null) {
			this.endReadable();
		}
		return this;
	}

	end(): this {
		return this.send(null);
	}

	restore(): this {
		Object.defineProperty(process, "stdin", {
			value: this.target,
			configurable: true,
			writable: false,
		});
		return this;
	}

	reset(removeListeners = false): this {
		const state = (this as any)._readableState;
		state.ended = false;
		state.endEmitted = false;
		if (removeListeners) {
			this.removeAllListeners();
		}
		return this;
	}

	override _read(size = Infinity): void {
		let count = 0;
		let read = true;
		// size=0 means Node.js is asking for data on a hwm=0 stream — treat as Infinity
		const effectiveSize = size === 0 ? Infinity : size;

		while (read && this._mockData.length && count < effectiveSize) {
			const item = this._mockData[0];
			const leftInChunk = item.length - item.pos;
			const remaining =
				effectiveSize === Infinity ? leftInChunk : effectiveSize - count;
			const toProcess = Math.min(leftInChunk, remaining);
			const chunk: string | Buffer | null = item.chunk(toProcess);

			if (
				!(item.encoding === null
					? this.push(chunk)
					: this.push(chunk, item.encoding))
			) {
				read = false;
			}

			if (item.done) {
				this._mockData.shift();
			}

			count += toProcess;
		}
	}

	private endReadable(): void {
		const state = (this as any)._readableState;
		if (!state.length) {
			state.ended = true;
			state.endEmitted = true;
			this.readable = false;
			this.emit("end");
		}
	}
}
