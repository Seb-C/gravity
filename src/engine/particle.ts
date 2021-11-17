import { ParticleType } from '../common/particle-type';
import { Particle as ParticleInterface, ParticleId } from '../common/particle';
import { Body } from './cluster/body';

export const MIN_VELOCITY_PER_SECOND = 0.01;
export const COLLISION_PUSHBACK_SECONDS = 0.2;

export class Particle implements ParticleInterface, Body {
	public id: ParticleId;
	public positionX: number;
	public positionY: number;
	public typeId: number;
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

	public updateFromCollision(body: Body, elapsedSeconds: number) {
		const pushbackPerSecond = body.radius / COLLISION_PUSHBACK_SECONDS;
		const currentPushback = pushbackPerSecond * elapsedSeconds;

		let deltaX = this.positionX - body.positionX;
		let deltaY = this.positionY - body.positionY;

		this.positionX += currentPushback > Math.abs(deltaX)
			? deltaX
			: currentPushback * Math.sign(deltaX);
		this.positionY += currentPushback > Math.abs(deltaY)
			? deltaY
			: currentPushback * Math.sign(deltaY);
	}
}
