import { Particle } from './particle';
import { SharedParticleProperties } from '../common/shared-particle-properties';

export type Node = Cluster | Particle;

export class RootCluster {
	public root: Node | null;
	public allParticles: Particle[];
	public allSharedParticles: SharedParticleProperties[];

	constructor() {
		this.root = null;
		this.allParticles = [];
		this.allSharedParticles = [];
	}

	public add(particle: Particle) {
		this.allParticles.push(particle);
		this.allSharedParticles.push(particle.sharedProperties);
		this.addToTree(particle);
	}

	public addToTree(particle: Particle) {
		if (this.root === null) {
			this.root = particle;
			return;
		}

		if (this.root instanceof Particle) {
			this.root = Cluster.createAndSetParents(this.root, particle, null);
			return;
		}

		let currentCluster: Cluster = this.root;
		while (true) {
			const distanceLeft = currentCluster.left.distance(particle);
			const distanceRight = currentCluster.right.distance(particle);
			if (distanceLeft <= distanceRight) {
				if (currentCluster.left instanceof Particle) {
					currentCluster.left = Cluster.createAndSetParents(currentCluster.left, particle, currentCluster);
					return;
				} else {
					currentCluster = currentCluster.left;
				}
			} else {
				if (currentCluster.right instanceof Particle) {
					currentCluster.right = Cluster.createAndSetParents(currentCluster.right, particle, currentCluster);
					return;
				} else {
					currentCluster = currentCluster.right;
				}
			}
		}
	}

	public remove(particle: Particle, index: number) {
		this.allParticles.splice(index, 1);
		this.allSharedParticles.splice(index, 1);
		this.removeFromTree(particle);
	}

	public removeFromTree(particle: Particle) {
		if (particle === this.root) {
			particle.parentCluster = null;
			this.root = null;
			return;
		}
		if (particle.parentCluster == null) {
			// The particle may not belong to this tree
			return;
		}

		const parentOfParentCluster = particle.parentCluster?.parentCluster;
		if (!parentOfParentCluster && this.root != particle.parentCluster) {
			throw new Error(`The cluster is not root, but it's parentCluster is null.`);
		}

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

	public static createAndSetParents(
		left: Node,
		right: Node,
		parentCluster: Cluster | null,
	): Cluster {
		const cluster = new Cluster(left, right, parentCluster);
		left.parentCluster = cluster;
		right.parentCluster = cluster;
		return cluster;
	}

	public updateBoundaries() {
		const previousMinX = this.minX;
		const previousMinY = this.minY;
		const previousMaxX = this.maxX;
		const previousMaxY = this.maxY;

		if (this.left instanceof Particle) {
			this.minX = this.left.sharedProperties.positionX - this.left.radius;
			this.minY = this.left.sharedProperties.positionY - this.left.radius;
			this.maxX = this.left.sharedProperties.positionX + this.left.radius;
			this.maxY = this.left.sharedProperties.positionX + this.left.radius;
		} else {
			this.minX = this.left.minX;
			this.minY = this.left.minY;
			this.maxX = this.left.maxX;
			this.maxY = this.left.maxY;
		}

		if (this.right instanceof Particle) {
			this.minX = Math.min(this.minX, this.right.sharedProperties.positionX - this.right.radius);
			this.minY = Math.min(this.minY, this.right.sharedProperties.positionY - this.right.radius);
			this.maxX = Math.max(this.maxX, this.right.sharedProperties.positionX + this.right.radius);
			this.maxY = Math.max(this.maxY, this.right.sharedProperties.positionY + this.right.radius);
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
		const deltaX = centerX - particle.sharedProperties.positionX;
		const deltaY = centerY - particle.sharedProperties.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	public doesCollide(particle: Particle): boolean {
		return (
			(
				particle.sharedProperties.positionX + particle.radius > this.minX
				|| particle.sharedProperties.positionX - particle.radius < this.maxX
			) && (
				particle.sharedProperties.positionY + particle.radius > this.minY
				|| particle.sharedProperties.positionY - particle.radius < this.maxY
			)
		);
	}
}
