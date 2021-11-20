import { TreeAble } from './root';
import { Node } from './node';
import { Body, bodiesDistanceCenter } from './body';

export class Cluster implements Body {
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
		const { positionX, positionY, radius } = Cluster.computeBoundaries(
			this.left instanceof Node ? this.left.particle : this.left,
			this.right instanceof Node ? this.right.particle : this.right,
		);
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

	public static computeBoundaries(left: Body, right: Body) {
		const leftElement = left instanceof Node ? left.particle : left;
		const rightElement = right instanceof Node ? right.particle : right;

		// Taking an average point between the centers of the two circles
		const positionX = leftElement.positionX + ((rightElement.positionX - leftElement.positionX) / 2);
		const positionY = leftElement.positionY + ((rightElement.positionY - leftElement.positionY) / 2);

		// Approximating the radius from the distance between the two circles
		const distance = bodiesDistanceCenter(leftElement, rightElement);
		const radius = (distance / 2) + Math.max(leftElement.radius, rightElement.radius);

		return { positionX, positionY, radius }
	}
}
