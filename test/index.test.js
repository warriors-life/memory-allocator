import MemoryAllocator, { MemoryRef } from 'memory-allocator';

function formatRanges(ranges) {
	return ranges.map(([start, end]) => `[${start}, ${end})`).join(', ');
}

expect.extend({
	async toHaveRanges(allocator, ...list) {
		await new Promise(resolve => setTimeout(resolve, 30)); // wait until ranges have compacted

		let pass = true;
		const refs = [];
		const ranges = [];

		for (const [start, end] of list) {
			const ref = allocator.allocate(end - start);
			refs.push(ref);
			const { byteOffset, byteLength } = ref.toDataView();
			ranges.push([byteOffset, byteOffset + byteLength]);
			if (byteOffset !== start || byteLength !== end - start) {
				pass = false;
				break;
			}
		}

		refs.forEach(ref => ref.free());

		await new Promise(resolve => setTimeout(resolve, 30)); // wait until ranges have compacted

		return {
			message: () => `expected allocator's first available ranges${pass ? ' not' : ''} to be ${this.utils.printExpected(formatRanges(list))}${pass ? '' : ', received ' + this.utils.printReceived(formatRanges(ranges))}`,
			pass
		};
	}
});

let allocator;

beforeEach(() => allocator = new MemoryAllocator(16));

test('Memory allocation works', () => {
	const ref = allocator.allocate(2);
	expect(ref).toBeInstanceOf(MemoryRef);
	const dv = ref.toDataView();
	expect(dv.byteOffset).toBe(0);
	expect(dv.byteLength).toBe(2);
	ref.free();
});

test('Memory is proper splitted', async () => {
	const ref = allocator.allocate(2);
	await expect(allocator).toHaveRanges([2, 16]);
	ref.free();
});

test('Allocator can be created with default buffer size', () => {
	allocator = new MemoryAllocator();
	const ref = allocator.allocate(2);
	await expect(allocator).toHaveRanges([2, 1024 ** 2]);
	ref.free();
});

test('Multiple allocations work', async () => {
	const ref1 = allocator.allocate(2);
	const ref2 = allocator.allocate(5);
	await expect(allocator).toHaveRanges([7, 16]);
	ref2.free();
	ref1.free();
});

test('Available ranges compact', async () => {
	const ref = allocator.allocate(2);
	ref.free();
	await expect(allocator).toHaveRanges([0, 16]);
});

test('Available ranges compact even if freed in different order', async () => {
	const ref1 = allocator.allocate(2);
	const ref2 = allocator.allocate(5);
	ref1.free();
	await expect(allocator).toHaveRanges([0, 2], [7, 16]);
	ref2.free();
	await expect(allocator).toHaveRanges([0, 16]);
});

test('New buffers are created with proper bufferSize', async () => {
	const ref1 = allocator.allocate(15);
	const ref2 = allocator.allocate(5);
	await expect(allocator).toHaveRanges([15, 16], [5, 16]);
	ref2.free();
	ref1.free();
});

test('New buffers can be larger if required', async () => {
	const ref1 = allocator.allocate(15);
	const ref2 = allocator.allocate(32);
	ref2.free();
	await expect(allocator).toHaveRanges([15, 16], [0, 32]);
	ref1.free();
});

test('Memory in old buffers can still be allocated', async () => {
	const ref1 = allocator.allocate(15);
	const ref2 = allocator.allocate(5);
	const ref3 = allocator.allocate(1);
	await expect(allocator).toHaveRanges([5, 16]);
	ref3.free();
	ref2.free();
	ref1.free();
});

test('Even with multiple buffers memory is proper compacted', async () => {
	const ref1 = allocator.allocate(3);
	const ref2 = allocator.allocate(5);
	const ref3 = allocator.allocate(4);
	const ref4 = allocator.allocate(10);
	const ref5 = allocator.allocate(5);
	const ref6 = allocator.allocate(2);
	ref4.free();
	ref2.free();
	ref3.free();
	await expect(allocator).toHaveRanges([3, 12], [14, 16], [0, 10], [15, 16]);
	ref1.free();
	ref5.free();
	ref6.free();
	await expect(allocator).toHaveRanges([0, 16], [0, 16]);
});

test('Smallest sufficient range is always selected', async () => {
	const ref1 = allocator.allocate(3);
	const ref2 = allocator.allocate(5);
	const ref3 = allocator.allocate(4);
	const ref4 = allocator.allocate(10);
	const ref5 = allocator.allocate(5);
	const ref6 = allocator.allocate(2);
	ref4.free();
	ref2.free();
	ref3.free();
	await expect(allocator).toHaveRanges([3, 12], [14, 16], [0, 10], [15, 16]);
	const ref7 = allocator.allocate(1);
	await expect(allocator).toHaveRanges([3, 12], [14, 16], [0, 10]);
	const ref8 = allocator.allocate(4);
	await expect(allocator).toHaveRanges([7, 12], [14, 16], [0, 10]);
	ref1.free();
	ref5.free();
	ref6.free();
	ref7.free();
	ref8.free();
});

test('MemoryAllocator.addBuffer() works', async () => {
	allocator.addBuffer(50);
	const ref = allocator.allocate(3);
	await expect(allocator).toHaveRanges([3, 50]);
	ref.free();
});

test('MemoryAllocator.addBuffer() with default size works', async () => {
	allocator.addBuffer();
	const ref = allocator.allocate(3);
	await expect(allocator).toHaveRanges([3, 16]);
	ref.free();
});

test('MemoryRef.toDataView() works', () => {
	const ref = allocator.allocate(8);
	const dv = ref.toDataView();
	expect(dv).toBeInstanceOf(DataView);
	expect(dv.byteOffset).toBe(0);
	expect(dv.byteLength).toBe(8);
	ref.free();
});

test('MemoryRef.toDataView() is readable and writable', () => {
	const ref = allocator.allocate(8);
	const dv = ref.toDataView();
	dv.setInt8(5, 3);
	expect(dv.getInt8(5)).toBe(3);
	ref.free();
});

test('MemoryRef.toTypedArray()\'s default is Uint8Array', () => {
	const ref = allocator.allocate(8);
	const arr = ref.toTypedArray();
	expect(arr).toBeInstanceOf(Uint8Array);
	expect(arr.byteOffset).toBe(0);
	expect(arr.byteLength).toBe(8);
	ref.free();
});

test('MemoryRef.toTypedArray() works', () => {
	const ref = allocator.allocate(8);
	[Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array].forEach(Class => {
		const arr = ref.toTypedArray(Class);
		expect(arr).toBeInstanceOf(Class);
		expect(arr.byteOffset).toBe(0);
		expect(arr.byteLength).toBe(8);
	});
	ref.free();
});

test('MemoryRef.toTypedArray() is readable and writable', () => {
	const ref = allocator.allocate(8);
	[Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array].forEach(Class => {
		const arr = ref.toTypedArray(Class);
		arr[0] = 5;
		expect(arr[0]).toBe(5);
	});
	[BigInt64Array, BigUint64Array].forEach(Class => {
		const arr = ref.toTypedArray(Class);
		arr[0] = 5n;
		expect(arr[0]).toBe(5n);
	});
	ref.free();
});
