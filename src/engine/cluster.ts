import { Particle } from './particle';

export type Node = Cluster | Particle;

export class RootCluster {
	public root: Node | null;
	public allParticles: Particle[];

	constructor() {
		this.root = null;
		this.allParticles = [];
	}

	public add(particle: Particle) {
		this.allParticles.push(particle);
		this.addToTree(particle);
	}

	public addToTree(particle: Particle) {
		if (this.root === null) {
			this.root = particle;
			return;
		}

		if (this.root instanceof Particle) {
			this.root = new Cluster(this.root, particle, null);
			particle.parentCluster = this.root;
			return;
		}

		let currentCluster: Cluster = this.root;
		while (true) {
			const distanceLeft = currentCluster.left.distance(particle);
			const distanceRight = currentCluster.right.distance(particle);
			if (distanceLeft <= distanceRight) {
				if (currentCluster.left instanceof Particle) {
					currentCluster.left = new Cluster(currentCluster.left, particle, currentCluster);
					particle.parentCluster = currentCluster;
					return;
				} else {
					currentCluster = currentCluster.left;
				}
			} else {
				if (currentCluster.right instanceof Particle) {
					currentCluster.right = new Cluster(currentCluster.right, particle, currentCluster);
					particle.parentCluster = currentCluster;
					return;
				} else {
					currentCluster = currentCluster.right;
				}
			}
		}
	}

	public remove(particle: Particle, index: number) {
		this.allParticles.splice(index, 1);
		this.removeFromTree(particle);
	}

	public removeFromTree(particle: Particle) {
		if (particle.parentCluster == null) {
			return;
		}

		const parentOfParentCluster = particle.parentCluster.parentCluster;
		if (parentOfParentCluster == null && this.root != particle.parentCluster) {
			throw new Error(`The cluster is not root, but it's parentCluster is null.`);
		}

		// TODO unit test this to find the issue
		if (particle == particle.parentCluster.left) {
			if (parentOfParentCluster == null) {
				this.root = particle.parentCluster.right;
				this.root.parentCluster = null;
			} else if (particle.parentCluster == parentOfParentCluster.left) {
				parentOfParentCluster.left = particle.parentCluster.right;
				parentOfParentCluster.left.parentCluster = parentOfParentCluster;
			} else if (particle.parentCluster == parentOfParentCluster.right) {
				parentOfParentCluster.right = particle.parentCluster.right;
				parentOfParentCluster.right.parentCluster = parentOfParentCluster;
			}
		} else if (particle == particle.parentCluster.right) {
			if (parentOfParentCluster == null) {
				this.root = particle.parentCluster.left;
				this.root.parentCluster = null;
			} else if (particle.parentCluster == parentOfParentCluster.left) {
				parentOfParentCluster.left = particle.parentCluster.left;
				parentOfParentCluster.left.parentCluster = parentOfParentCluster;
			} else if (particle.parentCluster == parentOfParentCluster.right) {
				parentOfParentCluster.right = particle.parentCluster.left;
				parentOfParentCluster.right.parentCluster = parentOfParentCluster;
			}
		}

		particle.parentCluster = null;
	}

	public tick(elapsedSeconds: number) {
		for (let i = 0; i < this.allParticles.length; i++) {
			const particle = this.allParticles[i];
			if (particle.move(elapsedSeconds)) {
				// TODO this is not optimistic, there must be a better way to update the tree
				this.removeFromTree(particle);
				this.addToTree(particle);
			}

			const collidedParticle = this.searchCollision(particle);
			if (collidedParticle !== null) {
				particle.updateVelocityFromCollision(collidedParticle);
			}
		}
	}

	/**
	 * Searches in the tree if the given particle collides with any other.
	 * If it does, then the other particle will be returned.
	 */
	public searchCollision(particle: Particle): Particle | null {
		if (this.root === null) {
			return null;
		}

		if (this.root instanceof Particle) {
			if (this.root.doesCollide(particle)) {
				return this.root;
			} else {
				return null;
			}
		}

		if (!this.root.doesCollide(particle)) {
			return null;
		}

		let currentNode: Cluster = this.root;
		while (true) {
			if (currentNode.left.doesCollide(particle)) {
				if (currentNode.left instanceof Particle) {
					return currentNode.left;
				} else {
					currentNode = currentNode.left;
				}
			} else if (currentNode.right.doesCollide(particle)) {
				if (currentNode.right instanceof Particle) {
					return currentNode.right;
				} else {
					currentNode = currentNode.right;
				}
			} else {
				return null;
			}
		}
	}
}

export class Cluster {
	public left: Node;
	public right: Node;
	public parentCluster: Cluster | null;

	public minX!: number;
	public minY!: number;
	public maxX!: number;
	public maxY!: number;

	constructor(left: Node, right: Node, parentCluster: Cluster | null) {
		this.left = left;
		this.right = right;
		this.parentCluster = parentCluster;
		this.updateBoundaries();
	}

	public updateBoundaries() {
		const previousMinX = this.minX;
		const previousMinY = this.minY;
		const previousMaxX = this.maxX;
		const previousMaxY = this.maxY;

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

		if (previousMinX != this.minX
			|| previousMinY != this.minY
			|| previousMaxX != this.maxX
			|| previousMaxY != this.maxY
		) {
			this.parentCluster?.updateBoundaries();
		}
	}

	public distance(particle: Particle): number {
		const centerX = this.maxX = this.minX;
		const centerY = this.maxY = this.minY;
		const deltaX = centerX - particle.positionX;
		const deltaY = centerY - particle.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	public doesCollide(particle: Particle): boolean {
		return (
			(
				particle.positionX + particle.radius > this.minX
				|| particle.positionX - particle.radius < this.maxX
			) && (
				particle.positionY + particle.radius > this.minY
				|| particle.positionY - particle.radius < this.maxY
			)
		);
	}
}
