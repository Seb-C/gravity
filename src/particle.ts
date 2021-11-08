export class Particle {
	static physicalRadius = 5;
	static displayRadius = 5;

	public x: number;
	public y: number;
	public style: string;
	public direction: number = 0;
	public velocityPerSecond: number = 0;
	public decelerationRatePerSecond: number = 0.6;
	public isMoving: boolean = true;
	public bounceFactor: number = 1.5;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.style = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
	}

	tick(particles: Particle[], elapsedSeconds: number) {
		if (this.isMoving) {
			this.velocityPerSecond *= 1 - (this.decelerationRatePerSecond * elapsedSeconds);
			if (this.velocityPerSecond < 0.01) {
				// Otherwise we can never not be moving
				this.velocityPerSecond = 0;
			}

			this.move(elapsedSeconds);
			this.computeCollisions(particles);
		}
	}

	private move(elapsedSeconds: number) {
		const delta = this.velocityPerSecond * elapsedSeconds;
		this.x += delta * Math.cos(this.direction);
		this.y += delta * Math.sin(this.direction);
	}

	private computeCollisions(particles: Particle[]) {
		let hasMoved = false;
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i];
			if (particle === this) {
				continue;
			}

			const distance = this.distance(particle);
			if (distance >= (Particle.physicalRadius * 2)) {
				continue;
			}

			// TODO merge multiple directions and speeds if there are multiple collisions
			this.direction = Math.atan2(this.y - particle.y, this.x - particle.x);
			this.velocityPerSecond = ((Particle.physicalRadius * 2) - distance * this.bounceFactor); // TODO broken?

			hasMoved = true;
			particle.isMoving = true;
		}

		this.isMoving = hasMoved || this.velocityPerSecond > 0;
	}

	private distance(particle: Particle): number {
		const deltaX = this.x - particle.x;
		const deltaY = this.y - particle.y;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
}
