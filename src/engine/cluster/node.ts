import { Particle } from '../particle';
import { Cluster } from './cluster';
import { Body } from './body';

export class Node {
	public particle: Particle;
	public parentCluster: Cluster | null = null;

	constructor(particle: Particle) {
		this.particle = particle;
		this.parentCluster = this.parentCluster;
	}

	public doesCollide(body: Body): boolean {
		return this.particle.doesCollide(body);
	}
}
