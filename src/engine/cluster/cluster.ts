import { TreeAble } from './root';
import { Node } from './node';

export class Cluster {
	public left: TreeAble;
	public right: TreeAble;
	public parentCluster: Cluster | null;

	public positionX!: number;
	public positionY!: number;
	public radius!: number;

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
