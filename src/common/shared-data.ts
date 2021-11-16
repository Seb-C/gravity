import { Particle } from './particle';

export class SharedBuffers {
	public currentLength: number;
	public maxLength: number;
	public positionsX: SharedArrayBuffer;
	public positionsY: SharedArrayBuffer;
	public typeIds: SharedArrayBuffer;

	constructor(maxLength: number) {
		this.currentLength = 0;
		this.maxLength = maxLength;
		this.positionsX = new SharedArrayBuffer(
			this.maxLength * Float32Array.BYTES_PER_ELEMENT,
		);
		this.positionsY = new SharedArrayBuffer(
			this.maxLength * Float32Array.BYTES_PER_ELEMENT,
		);
		this.typeIds = new SharedArrayBuffer(
			this.maxLength * Float32Array.BYTES_PER_ELEMENT,
		);
	}
}

export class SharedData {
	public buffers: SharedBuffers;

	public positionsX: Float32Array; // 64 not supported by WebGL
	public positionsY: Float32Array; // 64 not supported by WebGL
	public typeIds: Float32Array; // Float required by WebGL

	constructor(buffers: SharedBuffers) {
		this.buffers = buffers;
		this.positionsX = new Float32Array(this.buffers.positionsX);
		this.positionsY = new Float32Array(this.buffers.positionsY);
		this.typeIds = new Float32Array(this.buffers.typeIds);
	}

	public set(index: number, particle: Particle) {
		if (index >= this.buffers.maxLength) {
			throw new Error(`Cannot set a particle at index ${index} because the max amount is ${this.buffers.maxLength}.`);
		}

		this.buffers.currentLength = index + 1;
		this.positionsX[index] = particle.positionX;
		this.positionsY[index] = particle.positionY;
		this.typeIds[index] = particle.typeId;
	}
}
