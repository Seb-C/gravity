export class Particle {
	static radius = 10;

	static constantSpeed = 10; // pixels per second

	constructor(
		public x: number,
		public y: number,
		public style: string,
	) {}

	tick(particles: Particle[], elapsed: number) {
		const velocity = Particle.constantSpeed * (elapsed / 1000);
		for (let i = 0; i < particles.length; i++) {
			if (particles[i] === this) {
				continue;
			}

			const distance = this.distance(particles[i]);
			if (distance > Particle.radius*2) {
				continue;
			}

			const direction = Math.atan2(this.y - particles[i].y, this.x - particles[i].x);
			this.x += velocity * Math.cos(direction);
			this.y += velocity * Math.sin(direction);
		}
	}

	private distance(particle: Particle): number {
		return Math.sqrt(Math.pow(this.x - particle.x, 2) + Math.pow(this.y - particle.y, 2));
	}
}
