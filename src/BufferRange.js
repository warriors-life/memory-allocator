export default class BufferRange {
	#buffer;
	#start;
	#end;
	#left;
	#right;

	constructor(buffer, start, end, left = null, right = null) {
		this.#buffer = buffer;
		this.#start = start;
		this.#end = end;
		this.#left = left;
		this.#right = right;
	}

	get buffer() {
		this.#buffer;
	}

	get start() {
		return this.#start;
	}

	get end() {
		return this.#end;
	}

	get length() {
		return this.#end - this.#start;
	}

	get left() {
		return this.#left;
	}

	get right() {
		return this.#right;
	}

	sub(size) {
		return this.split(this.#start + size);
	}

	split(middle) {
		const left = new BufferRange(this.#buffer, this.#start, middle, this.#left, null);
		const right = new BufferRange(this.#buffer, middle, this.#end, left, this.#right);
		left.#right = right;
		return [left, right];
	}

	mergeLeft() {
		return new BufferRange(this.#buffer, this.#left.#start, this.#end, this.#left.#left, this.#right);
	}

	mergeRight() {
		return new BufferRange(this.#buffer, this.#start, this.#right.#end, this.#left, this.#right.#right);
	}
}
