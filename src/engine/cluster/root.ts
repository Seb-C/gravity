import { Particle } from '../particle';
import { Node } from './node';
import { Cluster } from './cluster';

export type TreeAble = Cluster | Node;

export class Root {
	public root: TreeAble | null;
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
			const costOfAddingLeft = this.costOfAdding(node, currentCluster.left);
			const costOfAddingRight = this.costOfAdding(node, currentCluster.right);

			if (costOfAddingLeft <= costOfAddingRight) {
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

			const collidedNodes = this.searchCollision(node);
			for (let j = 0; j < collidedNodes.length; j++) {
				node.particle.updateVelocityFromCollision(collidedNodes[j].particle);
			}
		}
	}

	/**
	 * Searches in the tree if the given node collides with any other.
	 * If it does, then the collided node will be returned.
	 */
	public searchCollision(node: Node): Node[] {
		if (this.root === null) {
			return [];
		}

		if (this.root instanceof Node) {
			if (this.root.particle.doesCollide(node.particle)) {
				return [this.root];
			} else {
				return [];
			}
		}

		const stack: Cluster[] = [this.root];
		const collidingNodes: Node[] = [];

		let currentCluster: Cluster | undefined;
		while (currentCluster = stack.pop()) {
			if (currentCluster.left.doesCollide(node)) {
				if (currentCluster.left instanceof Node) {
					collidingNodes.push(currentCluster.left);
				} else {
					stack.push(currentCluster.left);
				}
			}
			if (currentCluster.right.doesCollide(node)) {
				if (currentCluster.right instanceof Node) {
					collidingNodes.push(currentCluster.right);
				} else {
					stack.push(currentCluster.right);
				}
			}
		}

		return collidingNodes;
	}

	public costOfAdding(node: Node, target: Cluster | Node): number {
		const radiusBefore = target instanceof Node ? target.particle.radius : target.radius;
		const { radius: radiusAfter } = Cluster.computeBoundaries(node, target);

		// Returning the increase of the cluster's area as a cost
		return (Math.PI * radiusAfter * radiusAfter) - (Math.PI * radiusBefore * radiusBefore);
	}
}
