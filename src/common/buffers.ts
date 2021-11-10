export class BuffersData {
	public xPositions: SharedArrayBuffer;
	public yPositions: SharedArrayBuffer;
	public types: SharedArrayBuffer;

	constructor(length: number) {
		this.xPositions = new SharedArrayBuffer(length * Float64Array.BYTES_PER_ELEMENT);
		this.yPositions = new SharedArrayBuffer(length * Float64Array.BYTES_PER_ELEMENT);
		this.types = new SharedArrayBuffer(length * Uint8Array.BYTES_PER_ELEMENT);
	}
}

export class Buffers {
	public data: BuffersData;
	public xPositions: Float64Array;
	public yPositions: Float64Array;
	public types: Uint8Array;

	constructor(data: BuffersData) {
		this.data = data;
		this.xPositions = new Float64Array(this.data.xPositions);
		this.yPositions = new Float64Array(this.data.yPositions);
		this.types = new Uint8Array(this.data.types);
	}
}
