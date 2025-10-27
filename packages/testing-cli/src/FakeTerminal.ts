import type EventEmitter from "node:events";
import { getEventBus } from "./eventBus";

export class FakeTerminal {
	private lines: string[] = [];
	private cursorY = 0;
	private cursorX = 0;
	private logger: any[][] = [];
	private enableLogTerm: boolean;
	private eventBus: EventEmitter;

	constructor(enableLogTerm: boolean = false, seed: string) {
		this.enableLogTerm = enableLogTerm;
		this.eventBus = getEventBus(seed);
	}

	write(chunk: string | Buffer) {
		const text = typeof chunk === "string" ? chunk : chunk.toString();
		const segments = text.split("\n");

		if (segments.length > 1 && !segments[segments.length - 1]) {
			segments.pop();
		}

		setInterval(() => {
			this.eventBus.emit("start");
		}, 2);

		for (const segment of segments) {
			this.processSegment(segment);
		}
	}

	private processSegment(segment: string) {
		if (this.enableLogTerm) {
			this.logger.push(["---"]);
			this.logger.push(["lines", [...this.lines]]);
			this.logger.push(["segment", segment]);
			this.logger.push(["cursorY", this.cursorY]);
			this.logger.push(["cursorX", this.cursorX]);
		}

		let fragments = [""];

		if (segment) {
			fragments = segment
				.split(/(\u001b\[[0-9;]*[ABGK])/g)
				.filter((frag) => Boolean(frag));
		}

		for (const [index, frag] of Object.entries(fragments)) {
			const isMove = frag.match(/(\u001b\[[0-9;]*[ABGK])/g);
			if (isMove) {
				const match = frag.match(/\u001b\[([0-9]*)([ABGK])/);
				const value = match[1] ? parseInt(match[1], 10) : 1;
				const code = match[2];

				switch (code) {
					case "A": //up
						this.cursorY = Math.max(0, this.cursorY - value);
						if (this.enableLogTerm) this.logger.push(["up", this.cursorY]);
						this.eventBus.emit("action");
						break;
					case "B": {
						//down
						const downValue = this.cursorY + value;
						this.cursorY =
							downValue <= this.lines.length - 1
								? downValue
								: this.lines.length - 1;
						if (this.enableLogTerm) this.logger.push(["down", this.cursorY]);
						this.eventBus.emit("action");
						break;
					}
					case "G": //horizontal
						if (
							this.cursorY > 0 &&
							Number(index) === 0 &&
							this.cursorY > this.lines.length - 1
						) {
							this.cursorY--;
						}
						this.cursorX = Math.max(0, value - 1);
						if (this.enableLogTerm)
							this.logger.push(["horizontal", this.cursorX]);
						this.eventBus.emit("action");
						break;
					case "K": //clear line
						if (
							this.cursorY > 0 &&
							Number(index) === 0 &&
							this.cursorY > this.lines.length - 1
						) {
							this.cursorY--;
						}
						this.lines[this.cursorY] = "";
						if (
							this.cursorY < this.lines.length - 1 &&
							this.lines[this.cursorY + 1] === ""
						) {
							this.lines.pop();
						}
						if (this.enableLogTerm)
							this.logger.push(["clear line", this.cursorY]);
						this.eventBus.emit("action");
						break;
				}
			} else {
				if (this.enableLogTerm) this.logger.push(["->", frag]);
				const existing = this.lines[this.cursorY] || "";
				const padded = existing.padEnd(this.cursorX, " ");
				const updated =
					padded.slice(0, this.cursorX) +
					frag +
					padded.slice(this.cursorX + frag.length);

				this.lines[this.cursorY] = updated;
				this.cursorX += frag.length;
				this.cursorY++;
				this.eventBus.emit("action");
			}
		}
		this.cursorX = 0;
	}

	getOutput(): string {
		return this.lines.filter(Boolean).join("\n");
	}

	getLines(): string[] {
		return [...this.lines];
	}

	getLogger(): any[][] {
		return this.logger;
	}
}
