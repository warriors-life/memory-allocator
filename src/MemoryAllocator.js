import BufferRange from './BufferRange.js';
import MemoryRef from './MemoryRef.js';
import Ranges from './Ranges.js';

export default class MemoryAllocator {
	// #memoryRefs = new Set();
	#ranges = new Ranges();
	#bufferSize;

	constructor(bufferSize = 1024 ** 2) {
		this.#bufferSize = bufferSize;
	}

	addBuffer(size = 0, add = true) {
		const buffer = new ArrayBuffer(Math.max(this.#bufferSize, size));
		const range = new BufferRange(buffer, 0, buffer.byteLength);
		if (add) this.#ranges.add(range);
		return range;
	}

	allocate(size) {
		let range = this.#ranges.pop(size);
		if (range === undefined) range = this.addBuffer(size, false);

		const [allocatedRange, remainingRange] = range.sub(size);
		if (remainingRange.length > 0) this.#ranges.add(remainingRange);

		const ref = new MemoryRef(allocatedRange);
		ref.on('free', range => this.#free(ref, range));
		// this.#memoryRefs.add(ref);
		return ref;
	}

	async #free(ref, range) {
		// this.#memoryRefs.delete(ref);
		if (this.#ranges.remove(range.left)) range = range.mergeLeft();
		if (this.#ranges.remove(range.right)) range = range.mergeRight();
		this.#ranges.add(range);
	}
}
