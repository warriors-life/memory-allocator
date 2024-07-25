import { AVLTree } from '@foxglove/avl';

export default class Ranges {
	#tree = new AVLTree();

	add(range) {
		let set = this.#tree.get(range.length);
		if (set === undefined) this.#tree.set(range.length, set = new Set());
		set.add(range);
	}

	remove(range) {
		if (range === null) return false;
		const set = this.#tree.get(range.length);
		if (set === undefined) return false;
		const success = set.delete(range);
		if (set.size === 0) this.#tree.delete(range.length);
		return success;
	}

	pop(minLength) {
		const entry = this.#tree.findGreaterThanOrEqual(minLength);
		if (entry === undefined) return undefined;
		const set = entry[1];
		const range = set.values().next().value;
		set.delete(range);
		if (set.size === 0) this.#tree.delete(range.length);
		return range;
	}
}