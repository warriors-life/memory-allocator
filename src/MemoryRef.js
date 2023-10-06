import EventEmitter from 'events';

export default class MemoryRef extends EventEmitter {
	#range;

	constructor(range) {
		super();
		this._set(range);
	}

	_set(range) {
		this.#range = range;
	}

	async free() {
		const range = this.#range;
		this.#range = null;
		this.emit('free', range);
	}

	toDataView() {
		return new DataView(this.#range.buffer, this.#range.start, this.#range.length);
	}

	toTypedArray(Class = Uint8Array) {
		return new Class(this.#range.buffer, this.#range.start, this.#range.length / Class.BYTES_PER_ELEMENT);
	}
}
