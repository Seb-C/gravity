export class Particle {
	static physicalRadius = 5;
	static displayRadius = 5;

	static constantSpeed = 1; // pixels per second? TODO

	public x: number;
	public y: number;
	public style: string;
	public direction: number;
	public velocityPerSecond: number;
	public decelerationRatePerSecond: number;
	public isMoving: boolean;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.style = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
		this.direction = 0;
		this.velocityPerSecond = 0;
		this.decelerationRatePerSecond = 1; // per second
		this.isMoving = true;
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

			if (!this.doesCollide(particle)) {
				continue;
			}

			// TODO merge multiple directions if there are multiple collisions
			this.direction = Math.atan2(this.y - particle.y, this.x - particle.x);
			// TODO have a proper, non-constant speed
			this.velocityPerSecond += Particle.constantSpeed;

			hasMoved = true;
			particle.isMoving = true;
		}

		this.isMoving = hasMoved || this.velocityPerSecond > 0;
	}

	static physicalPerimeter = Particle.physicalRadius * 2;
	private doesCollide(particle: Particle): boolean {
		const deltaX = this.x - particle.x;
		const deltaY = this.y - particle.y;
		if (deltaX > Particle.physicalPerimeter || deltaY > Particle.physicalPerimeter) {
			return false
		}

		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		return distance < Particle.physicalPerimeter;
	}
}
