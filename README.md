# memory-allocator
A simple ArrayBuffer memory allocator for JS.

Not to be confused with the [`memory-pool`](https://www.npmjs.com/package/memory-pool) package, which removes the overhead of object creation by maintaining a pool of them and modifying their properties.

## License
See the [LICENSE](LICENSE) file.

## Contributing
Feel free to [open an issue](https://github.com/warriors-life/memory-allocator/issues/new) or [make a pull request](https://github.com/warriors-life/memory-allocator/pulls)! You can find contributing guidelines [here](CONTIBUTING.md) and as a start you can work on any issue labelled ["good first issue"](https://github.com/warriors-life/memory-allocator/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

# Documentation
The package exports `MemoryAllocator` class as default.

## class MemoryAllocator
The main class.

### constructor(bufferSize: number = 1024 ** 2)
`bufferSize` parameters controls minimal size of the new array buffers created by MemoryAllocator when it is impossible to allocate data in old buffers.

### .addBuffer(size?: number >= bufferSize): ignore
Manually create a buffer of the specified size.

### .allocate(size): MemoryRef
Allocate a slice of memory of the specified size. The resulting memory ref is returned.

## class MemoryRef
Reference to a slice of memory. Note that underlying slice may be relocated during a manual defragmentation.

### async .free(): void
Mark the reference as freed. It can no longer be used after that and the underlying memory may be redistributed.

### .toDataView(): DataView
Returns a DataView of the underlying memory, which can be read and written to.

### .toTypedArray(class?: Class\<? extends TypedArray\> = Uint8Array): class
Returns a typed array mapped to the underlying memory, which can be read and written to.
