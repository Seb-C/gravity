import { Particle } from '../particle';
import { Node } from './node';
import { Cluster } from './cluster';
import { SharedBuffers, SharedData } from '../../common/shared-data';
import { ParticleId } from '../../common/particle';
import { Body, bodiesDoesCollide } from './body';

export type TreeAble = Cluster | Node;

export class Root {
	public root: TreeAble | null;
	public allNodes: Node[];
	public sharedData: SharedData;
	public particlesById: Map<ParticleId, Particle>;

	constructor(sharedData: SharedData) {
		this.root = null;
		this.allNodes = [];
		this.sharedData = sharedData;
		this.particlesById = new Map<ParticleId, Particle>();
	}

	public add(index: number, particle: Particle) {
		const node = new Node(particle);
		this.sharedData.set(index, particle);
		this.allNodes[index] = node;
		this.particlesById.set(particle.id, particle);
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
			const hasMoved = node.particle.move(elapsedSeconds);

			const influences = this.searchInfluences(node.particle);
			for (let j = 0; j < influences.length; j++) {
				const influence = influences[j];
				if (influence instanceof Node) {
					node.particle.updateFromCollision(influence.particle, elapsedSeconds);
				} else {
					node.particle.applyGravitationalInfluence(influence, elapsedSeconds);
				}
			}

			if (hasMoved || influences.length > 0) {
				this.sharedData.set(i, node.particle);
				this.removeFromTree(node);
				this.addToTree(node);
			}
		}
	}

	/**
	 * Searches in the tree if the given body is being influenced by any other.
	 * In the returned collection:
	 * - A Node is returned if it collides with the given body
	 * - A Cluster is returned if it's gravity influences the body
	 */
	public searchInfluences(body: Body): TreeAble[] {
		if (this.root === null) {
			return [];
		}

		if (this.root instanceof Node) {
			if (bodiesDoesCollide(this.root.particle, body)) {
				return [this.root];
			} else {
				return [];
			}
		}

		const stack: Cluster[] = [this.root];
		const influences: TreeAble[] = [];

		let currentCluster: Cluster | undefined;
		while (currentCluster = stack.pop()) {
			const leftBody = currentCluster.left instanceof Node ? currentCluster.left.particle : currentCluster.left;
			if (bodiesDoesCollide(leftBody, body)) {
				if (currentCluster.left instanceof Node) {
					influences.push(currentCluster.left);
				} else {
					stack.push(currentCluster.left);
					if (currentCluster.left.doesGravityInfluences(body)) {
						// TODO a cluster could influence a body without having a collision (gravitational influence radius > physical radius)
						// TODO however this would not work with the current method
						influences.push(currentCluster.left);
					}
				}
			}

			const rightBody = currentCluster.right instanceof Node ? currentCluster.right.particle : currentCluster.right;
			if (bodiesDoesCollide(rightBody, body)) {
				if (currentCluster.right instanceof Node) {
					influences.push(currentCluster.right);
				} else {
					stack.push(currentCluster.right);
					if (currentCluster.right.doesGravityInfluences(body)) {
						// TODO a cluster could influence a body without having a collision (gravitational influence radius > physical radius)
						// TODO however this would not work with the current method
						influences.push(currentCluster.right);
					}
				}
			}
		}

		return influences;
	}

	public costOfAdding(node: Node, target: TreeAble): number {
		const targetBody = target instanceof Node ? target.particle : target;
		const radiusBefore = targetBody.radius;
		const { radius: radiusAfter } = Cluster.computeBoundaries(node.particle, targetBody);

		// Returning the increase of the cluster's area as a cost
		return (Math.PI * radiusAfter * radiusAfter) - (Math.PI * radiusBefore * radiusBefore);
	}

	public getParticleById(id: ParticleId): Particle | null {
		return this.particlesById.get(id) || null;
	}
}
