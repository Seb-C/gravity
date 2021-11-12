import { Particle } from './particle';

export class RootCluster {
	public root: Cluster | Node | null;
	public allNodes: Node[];
	public allParticles: Particle[];

	constructor() {
		this.root = null;
		this.allNodes = [];
		this.allParticles = [];
	}

	public add(node: Node) {
		this.allNodes.push(node);
		this.allParticles.push(node.particle);
		this.addToTree(node);
	}

	public addToTree(node: Node) {
		if (this.root === null) {
			this.root = node;
			return;
		}

		if (this.root instanceof Node) {
			this.root = Cluster.createAndSetParents(this.root, node, null);
			return;
		}

		let currentCluster: Cluster = this.root;
		while (true) {
			const distanceLeft = currentCluster.left.distance(node);
			const distanceRight = currentCluster.right.distance(node);
			if (distanceLeft <= distanceRight) {
				if (currentCluster.left instanceof Node) {
					currentCluster.left = Cluster.createAndSetParents(currentCluster.left, node, currentCluster);
					return;
				} else {
					currentCluster = currentCluster.left;
				}
			} else {
				if (currentCluster.right instanceof Node) {
					currentCluster.right = Cluster.createAndSetParents(currentCluster.right, node, currentCluster);
					return;
				} else {
					currentCluster = currentCluster.right;
				}
			}
		}
	}

	public remove(node: Node, index: number) {
		this.allNodes.splice(index, 1);
		this.allParticles.splice(index, 1);
		this.removeFromTree(node);
	}

	public removeFromTree(node: Node) {
		if (node === this.root) {
			node.parentCluster = null;
			this.root = null;
			return;
		}
		if (node.parentCluster == null) {
			// The node may not belong to this tree
			return;
		}

		const parentOfParentCluster = node.parentCluster?.parentCluster;
		if (!parentOfParentCluster && this.root != node.parentCluster) {
			throw new Error(`The cluster is not root, but it's parentCluster is null.`);
		}

		if (node == node.parentCluster.left) {
			if (parentOfParentCluster == null) {
				this.root = node.parentCluster.right;
				this.root.parentCluster = null;
			} else if (node.parentCluster == parentOfParentCluster.left) {
				parentOfParentCluster.left = node.parentCluster.right;
				parentOfParentCluster.left.parentCluster = parentOfParentCluster;
			} else if (node.parentCluster == parentOfParentCluster.right) {
				parentOfParentCluster.right = node.parentCluster.right;
				parentOfParentCluster.right.parentCluster = parentOfParentCluster;
			}
		} else if (node == node.parentCluster.right) {
			if (parentOfParentCluster == null) {
				this.root = node.parentCluster.left;
				this.root.parentCluster = null;
			} else if (node.parentCluster == parentOfParentCluster.left) {
				parentOfParentCluster.left = node.parentCluster.left;
				parentOfParentCluster.left.parentCluster = parentOfParentCluster;
			} else if (node.parentCluster == parentOfParentCluster.right) {
				parentOfParentCluster.right = node.parentCluster.left;
				parentOfParentCluster.right.parentCluster = parentOfParentCluster;
			}
		}

		node.parentCluster = null;
	}

	public tick(elapsedSeconds: number) {
		for (let i = 0; i < this.allNodes.length; i++) {
			const node = this.allNodes[i];
			if (node.particle.move(elapsedSeconds)) {
				this.removeFromTree(node);
				this.addToTree(node);
			}

			const collidedNode = this.searchCollision(node);
			if (collidedNode !== null) {
				node.particle.updateVelocityFromCollision(collidedNode.particle);
			}
		}
	}

	/**
	 * Searches in the tree if the given node collides with any other.
	 * If it does, then the other node will be returned.
	 */
	public searchCollision(node: Node): Node | null {
		if (this.root === null) {
			return null;
		}

		if (this.root instanceof Node) {
			if (this.root.particle.doesCollide(node.particle)) {
				return this.root;
			} else {
				return null;
			}
		}

		if (!this.root.doesCollide(node)) {
			return null;
		}

		let currentNode: Cluster = this.root;
		while (true) {
			if (currentNode.left.doesCollide(node)) {
				if (currentNode.left instanceof Node) {
					return currentNode.left;
				} else {
					currentNode = currentNode.left;
				}
			} else if (currentNode.right.doesCollide(node)) {
				if (currentNode.right instanceof Node) {
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
	public left: Cluster | Node;
	public right: Cluster | Node;
	public parentCluster: Cluster | null;

	public positionX!: number;
	public positionY!: number;
	public radius!: number;

	constructor(left: Cluster | Node, right: Cluster | Node, parentCluster: Cluster | null) {
		this.left = left;
		this.right = right;
		this.parentCluster = parentCluster;
		this.updateBoundaries();
	}

	public static createAndSetParents(
		left: Cluster | Node,
		right: Cluster | Node,
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

		const left = this.left instanceof Node ? this.left.particle : this.left;
		const right = this.right instanceof Node ? this.right.particle : this.right;

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

	public distance(node: Node): number {
		const deltaX = this.positionX - node.particle.positionX;
		const deltaY = this.positionY - node.particle.positionY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	public doesCollide(node: Node): boolean {
		const distance = this.distance(node);
		if (distance >= (this.radius + node.particle.radius)) {
			return false
		}

		return true;
	}
}

export class Node {
	public particle: Particle;
	public parentCluster: Cluster | null = null;

	constructor(particle: Particle) {
		this.particle = particle;
		this.parentCluster = this.parentCluster;
	}

	public distance(node: Node): number {
		return this.particle.distance(node.particle);
	}

	public doesCollide(node: Node): boolean {
		return this.particle.doesCollide(node.particle);
	}
}
