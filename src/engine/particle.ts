import { ParticleType } from '../common/particle-type';
import { ParticleTypeId } from '../common/particle-type';
import { Particle as ParticleInterface, ParticleId } from '../common/particle';
import { Body } from './cluster/body';

export const MIN_VELOCITY_PER_SECOND = 0.01;
export const COLLISION_PUSHBACK_SECONDS = 0.2;

export class Particle implements ParticleInterface, Body {
	public id: ParticleId;
	public positionX: number;
	public positionY: number;
	public type: ParticleType;
	public typeId: ParticleTypeId;
	public radius: number;

	public velocityXPerSecond: number = 0;
	public velocityYPerSecond: number = 0;

	public decelerationRatePerSecond: number = 0.8;

	constructor(
		id: ParticleId,
		positionX: number,
		positionY: number,
		type: ParticleType,
		radius: number,
	) {
		this.id = id;
		this.positionX = positionX;
		this.positionY = positionY;
		this.type = type;
		this.typeId = type.id;
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

	public updateFromCollision(particle: Particle, elapsedSeconds: number) {
		let deltaX = particle.positionX - this.positionX;
		let deltaY = particle.positionY - this.positionY;

		// Projecting back and slowing down if there is existing velocity toward it
		// Also transmitting the residual cynetic energy to the other particle
		const pushbackRate = particle.type.mass / (this.type.mass + particle.type.mass);
		if (Math.sign(this.velocityXPerSecond) == Math.sign(deltaX)) {
			particle.velocityXPerSecond += this.velocityXPerSecond * (1 - pushbackRate);
			this.velocityXPerSecond = -(this.velocityXPerSecond * pushbackRate);
		}
		if (Math.sign(this.velocityYPerSecond) == Math.sign(deltaY)) {
			particle.velocityYPerSecond += this.velocityYPerSecond * (1 - pushbackRate);
			this.velocityYPerSecond = -(this.velocityYPerSecond * pushbackRate);
		}

		const pushbackPerSecond = particle.radius / COLLISION_PUSHBACK_SECONDS;
		const currentPushback = pushbackPerSecond * elapsedSeconds;
		this.positionX -= currentPushback > Math.abs(deltaX)
			? deltaX
			: currentPushback * Math.sign(deltaX);
		this.positionY -= currentPushback > Math.abs(deltaY)
			? deltaY
			: currentPushback * Math.sign(deltaY);
	}

	public setVelocityTowards(
		target: Pick<Body, 'positionX' | 'positionY'>,
		velocityPerSecond: number,
	) {
		const deltaX = target.positionX - this.positionX;
		const deltaY = target.positionY - this.positionY;

		this.velocityXPerSecond = velocityPerSecond > Math.abs(deltaX)
			? deltaX
			: velocityPerSecond * Math.sign(deltaX);
		this.velocityYPerSecond = velocityPerSecond > Math.abs(deltaY)
			? deltaY
			: velocityPerSecond * Math.sign(deltaY);
	}
}
