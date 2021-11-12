import { ParticleType } from '../common/particle-type';
import { SharedParticleProperties } from '../common/shared-particle-properties';
import { Cluster } from './cluster';

export const MIN_VELOCITY_PER_SECOND = 0.01;

export class Particle {
	public sharedProperties: SharedParticleProperties;
	public parentCluster: Cluster | null = null;

	public velocityXPerSecond: number = 0;
	public velocityYPerSecond: number = 0;

	public decelerationRatePerSecond: number = 0.8;

	constructor(
		positionX: number,
		positionY: number,
		type: ParticleType,
		radius: number,
	) {
		this.sharedProperties = new SharedParticleProperties(positionX, positionY, radius, type);
	}

	/**
	 * Moves the particle from it's velocity, and returns
	 * whether or not it actually moved.
	 */
	public move(elapsedSeconds: number): boolean {
		if (Math.abs(this.velocityXPerSecond) < MIN_VELOCITY_PER_SECOND
			&& Math.abs(this.velocityYPerSecond) < MIN_VELOCITY_PER_SECOND
		) {
			return false;
		}

		this.sharedProperties.positionX += elapsedSeconds * this.velocityXPerSecond;
		this.sharedProperties.positionY += elapsedSeconds * this.velocityYPerSecond;

		const velocityDecreaseRate = this.decelerationRatePerSecond * elapsedSeconds;
		this.velocityXPerSecond *= 1 - velocityDecreaseRate;
		this.velocityYPerSecond *= 1 - velocityDecreaseRate;
		return true;
	}

	public doesCollide(particle: Particle): boolean {
		if (particle === this) {
			return false;
		}

		const distance = this.distance(particle);
		if (distance >= (this.sharedProperties.radius + particle.sharedProperties.radius)) {
			return false
		}

		return true;
	}

	public updateVelocityFromCollision(particle: Particle) {
		this.velocityXPerSecond += this.sharedProperties.positionX - particle.sharedProperties.positionX;
		this.velocityYPerSecond += this.sharedProperties.positionY - particle.sharedProperties.positionY;
	}

	public distance(particle: Particle): number {
		const deltaX = this.sharedProperties.positionX - particle.sharedProperties.positionX;
		const deltaY = this.sharedProperties.positionY - particle.sharedProperties.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
}
