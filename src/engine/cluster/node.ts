import { Particle } from '../particle';
import { Cluster } from './cluster';

export class Node {
	public particle: Particle;
	public parentCluster: Cluster | null = null;

	constructor(particle: Particle) {
		this.particle = particle;
		this.parentCluster = this.parentCluster;
	}

	public doesCollide(node: Node): boolean {
		return this.particle.doesCollide(node.particle);
	}
}
