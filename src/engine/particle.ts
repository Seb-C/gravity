import { ParticleType } from '../common/particle-type';

export class Particle {
	public positionX: number;
	public positionY: number;
	public typeIndex: number;
	public radius: number;

	public velocityXPerSecond: number = 0;
	public velocityYPerSecond: number = 0;

	public decelerationRatePerSecond: number = 0.8;

	constructor(
		positionX: number,
		positionY: number,
		type: ParticleType,
		radius: number,
	) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.typeIndex = type.index;
		this.radius = radius;
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
			if (distance >= (this.radius * 2)) {
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
