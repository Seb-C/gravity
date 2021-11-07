export class Particle {
	static radius = 10;

	static constantSpeed = 1; // pixels per second

	public x: number;
	public y: number;
	public style: string;
	public direction: number;
	public velocity: number;
	public decelerationRate: number

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.style = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
		this.direction = 0;
		this.velocity = 0;
		this.decelerationRate = 0.3;
	}

	tick(particles: Particle[], elapsed: number) {
		this.move(elapsed);

		this.direction = 0;
		this.velocity *= (1 - this.decelerationRate);

		this.computeCollisions(particles);
	}

	private move(elapsed: number) {
		const delta = this.velocity * (elapsed / 1000);
		this.x += delta * Math.cos(this.direction);
		this.y += delta * Math.sin(this.direction);
	}

	private computeCollisions(particles: Particle[]) {
		for (let i = 0; i < particles.length; i++) {
			if (particles[i] === this) {
				continue;
			}

			const distance = this.distance(particles[i]);
			if (distance > Particle.radius*2) {
				continue;
			}

			// TODO merge multiple directions if there are multiple collisions
			this.direction = Math.atan2(this.y - particles[i].y, this.x - particles[i].x);

			// TODO have a proper, non-constant speed
			this.velocity += Particle.constantSpeed;
		}
	}

	private distance(particle: Particle): number {
		return Math.sqrt(Math.pow(this.x - particle.x, 2) + Math.pow(this.y - particle.y, 2));
	}
}
