import { Particle } from './particle';

export type Node = Cluster | Particle;

export class RootCluster {
	public root: Node | null;
	public allParticles: Particle[];

	constructor() {
		this.root = null;
		this.allParticles = [];
	}

	add(particle: Particle) {
		this.allParticles.push(particle);
		if (this.root === null) {
			this.root = particle;
			return;
		}

		if (this.root instanceof Particle) {
			this.root = new Cluster(this.root, particle, null);
			return;
		}

		let currentCluster: Cluster = this.root;
		while (true) {
			const distanceLeft = currentCluster.left.distance(particle);
			const distanceRight = currentCluster.right.distance(particle);
			if (distanceLeft <= distanceRight) {
				if (currentCluster.left instanceof Particle) {
					currentCluster.left = new Cluster(currentCluster.left, particle, currentCluster);
					currentCluster = currentCluster.left;
					break;
				} else {
					currentCluster = currentCluster.left;
				}
			} else {
				if (currentCluster.right instanceof Particle) {
					currentCluster.right = new Cluster(currentCluster.right, particle, currentCluster);
					currentCluster = currentCluster.right;
					break;
				} else {
					currentCluster = currentCluster.right;
				}
			}
		}
	}

	tick(elapsedSeconds: number) {
		const particles = this.allParticles;
		for (let i = 0; i < particles.length; i++) {
			particles[i].move(elapsedSeconds);
			particles[i].computeCollisions(particles);
		}
	}
}

export class Cluster {
	public left: Node;
	public right: Node;
	public parent: Cluster | null;

	public minX!: number;
	public minY!: number;
	public maxX!: number;
	public maxY!: number;

	constructor(left: Node, right: Node, parent: Cluster | null) {
		this.left = left;
		this.right = right;
		this.parent = parent;
		this.updateBoundaries();
	}

	public updateBoundaries() {
		if (this.left instanceof Particle) {
			this.minX = this.left.positionX - this.left.radius;
			this.minY = this.left.positionY - this.left.radius;
			this.maxX = this.left.positionX + this.left.radius;
			this.maxY = this.left.positionX + this.left.radius;
		} else {
			this.minX = this.left.minX;
			this.minY = this.left.minY;
			this.maxX = this.left.maxX;
			this.maxY = this.left.maxY;
		}

		if (this.right instanceof Particle) {
			this.minX = Math.min(this.minX, this.right.positionX - this.right.radius);
			this.minY = Math.min(this.minY, this.right.positionY - this.right.radius);
			this.maxX = Math.max(this.maxX, this.right.positionX + this.right.radius);
			this.maxY = Math.max(this.maxY, this.right.positionY + this.right.radius);
		} else {
			this.minX = Math.min(this.minX, this.right.minX);
			this.minY = Math.min(this.minY, this.right.minY);
			this.maxX = Math.max(this.maxX, this.right.maxX);
			this.maxY = Math.max(this.maxY, this.right.maxY);
		}

		this.parent?.updateBoundaries();
	}

	public distance(particle: Particle): number {
		const centerX = this.maxX = this.minX;
		const centerY = this.maxY = this.minY;
		const deltaX = centerX - particle.positionX;
		const deltaY = centerY - particle.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
}
