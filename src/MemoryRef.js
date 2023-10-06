import EventEmitter from 'events';

export default class MemoryRef extends EventEmitter {
	#range;

	constructor(range) {
		this._set(range);
	}

	_set(range) {
		this.#range = range;
	}

	async free() {
		this.#range = null;
		this.emit('free');
	}

	toDataView() {
		return this.toTypedArray(DataView);
	}

	toTypedArray(cls = Uint8Array) {
		return new cls(this.#range.buffer, this.#range.start, this.#range.length);
	}
}
