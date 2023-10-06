import EventEmitter from 'events';

export default class MemoryRef extends EventEmitter {
	#range;

	constructor(range) {
		this.set(range);
	}

	set(range) {
		this.#range = range;
	}

	async free() {
		this.emit('free');
		this.#range = null;
	}

	toDataView() {
		return this.toTypedArray(DataView);
	}

	toTypedArray(cls = Uint8Array) {
		return new cls(this.#range.buffer, this.#range.start, this.#range.length);
	}
}
