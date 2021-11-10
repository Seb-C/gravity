import { Buffers } from '../common/buffers';
import { ParticleType } from '../common/particle-type';

export class Particle {
	private types: ParticleType[];
	private buffers: Buffers;

	private index: number;

	public velocityXPerSecond: number = 0;
	public velocityYPerSecond: number = 0;

	public decelerationRatePerSecond: number = 0.8;

	get positionX(): number { return this.buffers.xPositions[this.index]; }
	get positionY(): number { return this.buffers.yPositions[this.index]; }
	get type(): ParticleType { return this.types[this.buffers.types[this.index]]; }

	set positionX(positionX: number) { this.buffers.xPositions[this.index] = positionX; }
	set positionY(positionY: number) { this.buffers.yPositions[this.index] = positionY; }
	set type(type: ParticleType) { this.buffers.types[this.index] = type.index; }

	constructor(
		types: ParticleType[],
		buffers: Buffers,
		index: number,
		type: ParticleType,
		positionX: number,
		positionY: number,
	) {
		this.types = types;
		this.buffers = buffers;
		this.index = index;
		this.type = type;
		this.positionX = positionX;
		this.positionY = positionY;
	}

	tick(particles: Particle[], elapsedSeconds: number) {
		this.move(elapsedSeconds);

		const velocityDecreaseRate = this.decelerationRatePerSecond * elapsedSeconds;
		this.velocityXPerSecond *= 1 - velocityDecreaseRate;
		this.velocityYPerSecond *= 1 - velocityDecreaseRate;

		this.computeCollisions(particles);
	}

	private move(elapsedSeconds: number) {
		this.positionX += elapsedSeconds * this.velocityXPerSecond;
		this.positionY += elapsedSeconds * this.velocityYPerSecond;
	}

	private computeCollisions(particles: Particle[]) {
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i];
			if (particle === this) {
				continue;
			}

			const distance = this.distance(particle);
			if (distance >= (this.type.radius * 2)) {
				continue;
			}

			this.velocityXPerSecond += this.positionX - particle.positionX;
			this.velocityYPerSecond += this.positionY - particle.positionY;
		}
	}

	private distance(particle: Particle): number {
		const deltaX = this.positionX - particle.positionX;
		const deltaY = this.positionY - particle.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
}
