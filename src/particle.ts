export class Particle {
	static physicalRadius = 5;
	static displayRadius = 5;

	static physicalPerimeter = Particle.physicalRadius * 2;

	static constantSpeed = 1; // pixels per second

	public x: number;
	public y: number;
	public style: string;
	public direction: number;
	public velocity: number;
	public decelerationRate: number
	public isMoving: boolean;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.style = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
		this.direction = 0;
		this.velocity = 0;
		this.decelerationRate = 0.3;
		this.isMoving = true;
	}

	tick(particles: Particle[], elapsed: number) {
		if (this.isMoving) {
			this.move(elapsed);

			this.direction = 0;
			this.velocity *= (1 - this.decelerationRate);

			this.computeCollisions(particles);
		}
	}

	private move(elapsed: number) {
		const delta = this.velocity * (elapsed / 1000);
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
			this.velocity += Particle.constantSpeed;

			hasMoved = true;
			particle.isMoving = true;
		}

		this.isMoving = hasMoved;
	}

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
