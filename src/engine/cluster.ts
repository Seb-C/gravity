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

	public positionX!: number;
	public positionY!: number;
	public radius!: number;

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
		const previousPositionX = this.positionX;
		const previousPositionY = this.positionY;
		const previousRadius = this.radius;

		const left = this.left instanceof Particle ? this.left.sharedProperties : this.left;
		const right = this.right instanceof Particle ? this.right.sharedProperties : this.right;

		// Taking an average point between the centers of the two circles
		this.positionX = left.positionX + ((right.positionX - left.positionX) / 2);
		this.positionY = left.positionY + ((right.positionY - left.positionY) / 2);

		// Approximating the radius from the distance between the two circles
		const deltaX = left.positionX - right.positionX;
		const deltaY = left.positionY - right.positionY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		this.radius = (distance / 2) + Math.max(left.radius, right.radius);

		if (previousPositionX != this.positionX
			|| previousPositionY != this.positionY
			|| previousRadius != this.radius
		) {
			this.parentCluster?.updateBoundaries();
		}
	}

	public distance(particle: Particle): number {
		const deltaX = this.positionX - particle.sharedProperties.positionX;
		const deltaY = this.positionY - particle.sharedProperties.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	public doesCollide(particle: Particle): boolean {
		const distance = this.distance(particle);
		if (distance >= (this.radius + particle.sharedProperties.radius)) {
			return false
		}

		return true;
	}
}
