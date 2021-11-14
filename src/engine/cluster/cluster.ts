import { TreeAble } from './root';
import { Node } from './node';

export class Cluster {
	public left: TreeAble;
	public right: TreeAble;
	public parentCluster: Cluster | null;

	public positionX: number;
	public positionY: number;
	public radius: number;

	constructor(left: TreeAble, right: TreeAble, parentCluster: Cluster | null) {
		this.left = left;
		this.right = right;
		this.parentCluster = parentCluster;

		this.positionX = NaN;
		this.positionY = NaN;
		this.radius = NaN;

		this.updateBoundaries();
	}

	public static createAndSetParents(
		left: TreeAble,
		right: TreeAble,
		parentCluster: Cluster | null,
	): Cluster {
		const cluster = new Cluster(left, right, parentCluster);
		left.parentCluster = cluster;
		right.parentCluster = cluster;
		return cluster;
	}

	public updateBoundaries() {
		const { positionX, positionY, radius } = Cluster.computeBoundaries(this.left, this.right);
		const hasChanged = (
			positionX != this.positionX
			|| positionY != this.positionY
			|| radius != this.radius
		);

		this.positionX = positionX;
		this.positionY = positionY;
		this.radius = radius;

		if (hasChanged) {
			this.parentCluster?.updateBoundaries();
		}
	}

	public static computeBoundaries(left: TreeAble, right: TreeAble) {
		const leftElement = left instanceof Node ? left.particle : left;
		const rightElement = right instanceof Node ? right.particle : right;

		// Taking an average point between the centers of the two circles
		const positionX = leftElement.positionX + ((rightElement.positionX - leftElement.positionX) / 2);
		const positionY = leftElement.positionY + ((rightElement.positionY - leftElement.positionY) / 2);

		// Approximating the radius from the distance between the two circles
		const deltaX = leftElement.positionX - rightElement.positionX;
		const deltaY = leftElement.positionY - rightElement.positionY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const radius = (distance / 2) + Math.max(leftElement.radius, rightElement.radius);

		return { positionX, positionY, radius }
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
