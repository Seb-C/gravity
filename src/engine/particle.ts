import { ParticleType } from '../common/particle-type';
import { Particle as ParticleInterface } from '../common/particle';
import { Cluster } from './cluster';

export const MIN_VELOCITY_PER_SECOND = 0.01;

export class Particle implements ParticleInterface {
	public positionX: number;
	public positionY: number;
	public typeIndex: number;
	public radius: number;
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
		this.positionX = positionX;
		this.positionY = positionY;
		this.typeIndex = type.index;
		this.radius = radius;
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

		this.positionX += elapsedSeconds * this.velocityXPerSecond;
		this.positionY += elapsedSeconds * this.velocityYPerSecond;

		const velocityDecreaseRate = this.decelerationRatePerSecond * elapsedSeconds;
		this.velocityXPerSecond *= 1 - velocityDecreaseRate;
		this.velocityYPerSecond *= 1 - velocityDecreaseRate;
		return true;
	}

	public doesCollide(particle: Particle): boolean {
		const distance = this.distance(particle);
		if (distance >= (this.radius * 2)) {
			return false
		}

		return true;
	}

	public updateVelocityFromCollision(particle: Particle) {
		this.velocityXPerSecond += this.positionX - particle.positionX;
		this.velocityYPerSecond += this.positionY - particle.positionY;
	}

	public distance(particle: Particle): number {
		const deltaX = this.positionX - particle.positionX;
		const deltaY = this.positionY - particle.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
}
