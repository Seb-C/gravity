import { ParticleInterface } from './particle-interface';

export class SharedBuffers {
	public currentLength: number;
	public maxLength: number;
	public positionsX: SharedArrayBuffer;
	public positionsY: SharedArrayBuffer;
	public typeIndexes: SharedArrayBuffer;

	constructor(maxLength: number) {
		this.currentLength = 0;
		this.maxLength = maxLength;
		this.positionsX = new SharedArrayBuffer(
			this.maxLength * Float64Array.BYTES_PER_ELEMENT,
		);
		this.positionsY = new SharedArrayBuffer(
			this.maxLength * Float64Array.BYTES_PER_ELEMENT,
		);
		this.typeIndexes = new SharedArrayBuffer(
			this.maxLength * Uint8Array.BYTES_PER_ELEMENT,
		);
	}
}

export class SharedData {
	public buffers: SharedBuffers;

	public positionsX: Float64Array;
	public positionsY: Float64Array;
	public typeIndexes: Uint8Array;

	constructor(buffers: SharedBuffers) {
		this.buffers = buffers;
		this.positionsX = new Float64Array(this.buffers.positionsX);
		this.positionsY = new Float64Array(this.buffers.positionsY);
		this.typeIndexes = new Uint8Array(this.buffers.typeIndexes);
	}

	public set(index: number, particle: ParticleInterface) {
		if (index >= this.buffers.maxLength) {
			throw new Error(`Cannot set a particle at index ${index} because the max amount is ${this.buffers.maxLength}.`);
		}

		this.buffers.currentLength = index + 1;
		this.positionsX[index] = particle.positionX;
		this.positionsY[index] = particle.positionY;
		this.typeIndexes[index] = particle.typeIndex;
	}
}
