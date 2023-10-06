import BufferRange from './BufferRange.js';
import MemoryRef from './MemoryRef.js';

export default class MemoryAllocator {
	// #memoryRefs = new Set();
	#ranges = new Set();
	#bufferSize;

	constructor(bufferSize = 1024 ** 2) {
		this.#bufferSize = bufferSize;
	}

	addBuffer(size = 0) {
		const buffer = new ArrayBuffer(Math.max(this.#bufferSize, size));
		const range = new BufferRange(buffer, 0, buffer.byteLength);
		this.#ranges.add(range);
		return range;
	}

	allocate(size) {
		let range; // we try to find the smallest range of sufficient size
		for (const r of this.#ranges) {
			if (r.length >= size && (range === undefined || range.length > r.length)) range = r;
		}
		if (range === undefined) range = this.addBuffer(size);

		const [allocatedRange, remainingRange] = range.sub(size);
		this.#ranges.delete(range);
		if (remainingRange.length > 0) this.#ranges.add(remainingRange);

		const ref = new MemoryRef(allocatedRange);
		ref.on('free', range => this.#free(ref, range));
		// this.#memoryRefs.add(ref);
		return ref;
	}

	#free(ref, range) {
		// this.#memoryRefs.delete(ref);

		if (this.#ranges.has(range.left)) {
			this.#ranges.delete(range.left);
			range = range.mergeLeft();
		}

		if (this.#ranges.has(range.right)) {
			this.#ranges.delete(range.right);
			range = range.mergeRight();
		}

		this.#ranges.add(range);
	}
}
