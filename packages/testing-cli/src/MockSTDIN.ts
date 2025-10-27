import { Readable, type ReadableOptions } from "node:stream";

interface MockFlags {
	emittedData: boolean;
	lastChunk: string | Buffer | null;
}

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
			const value = this.data.slice(this.pos, this.pos + length);
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
	private _flags: MockFlags = {
		emittedData: false,
		lastChunk: null,
	};
	public readonly target: NodeJS.ReadableStream;
	public readonly isMock = true;

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
	}

	override emit(event: string | symbol, ...args: any[]): boolean {
		if (event === "data") {
			this._flags.emittedData = true;
			this._flags.lastChunk = null;
		}
		return super.emit(event, ...args);
	}

	send(text: string | Buffer | null, encoding?: BufferEncoding): this {
		if (Array.isArray(text)) {
			if (encoding) {
				throw new TypeError("Cannot specify encoding when text is an array");
			}
			text = text.join("\n");
		}
		const data = new MockData(text, encoding);
		this._mockData.push(data);
		this._read();
		if (!this._flags.emittedData && this.readableLength) {
			this.drainData();
		}
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

		while (read && this._mockData.length && count < size) {
			const item = this._mockData[0];
			const leftInChunk = item.length - item.pos;
			const remaining = size === Infinity ? leftInChunk : size - count;
			const toProcess = Math.min(leftInChunk, remaining);
			const chunk: string | Buffer | null = item.chunk(toProcess);
			this._flags.lastChunk = chunk;

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

	private drainData(): void {
		const state = (this as any)._readableState;
		const buffer = state.buffer;
		while (buffer.length) {
			const chunk = buffer.shift();
			if (chunk !== null) {
				state.length -= chunk.length;
				this.emit("data", chunk);
				this._flags.emittedData = false;
			}
		}
	}
}
