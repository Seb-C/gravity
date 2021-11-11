import "jasmine";
import { Cluster, RootCluster } from './cluster';
import { Particle } from './particle';
import { ParticleType } from '../common/particle-type';

describe('RootCluster', () => {
	describe('removeFromTree', () => {
		const type: ParticleType = { index: 1 };

		const createLeftTree = () => {
			const particleA = new Particle(0, 0, type, 1);
			const particleB = new Particle(0, 0, type, 2);
			const particleC = new Particle(0, 0, type, 3);

			const clusterB = Cluster.createAndSetParents(particleA, particleB, null);
			const clusterA = Cluster.createAndSetParents(clusterB, particleC, null);

			const rootCluster = new RootCluster();
			rootCluster.root = clusterA;

			return { particleA, particleB, particleC, clusterA, clusterB, rootCluster };
		}
		const createRightTree = () => {
			const particleA = new Particle(0, 0, type, 1);
			const particleB = new Particle(0, 0, type, 2);
			const particleC = new Particle(0, 0, type, 3);

			const clusterB = Cluster.createAndSetParents(particleB, particleC, null);
			const clusterA = Cluster.createAndSetParents(particleA, clusterB, null);

			const rootCluster = new RootCluster();
			rootCluster.root = clusterA;

			return { particleA, particleB, particleC, clusterA, clusterB, rootCluster };
		}
		const createOneLevelTree = () => {
			const particleA = new Particle(0, 0, type, 1);
			const particleB = new Particle(0, 0, type, 2);

			const cluster = Cluster.createAndSetParents(particleA, particleB, null);

			const rootCluster = new RootCluster();
			rootCluster.root = cluster;

			return { particleA, particleB, cluster, rootCluster };
		}

		it('left of a right cluster', () => {
			const { particleA, particleB, particleC, clusterA, clusterB, rootCluster } = createRightTree();
			rootCluster.removeFromTree(particleB);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(particleA);
			expect(clusterA.right).toBe(particleC);
			expect(particleA.parentCluster).toBe(clusterA);
			expect(particleC.parentCluster).toBe(clusterA);
			expect(particleB.parentCluster).toBe(null);
		});
		it('right of a right cluster', () => {
			const { particleA, particleB, particleC, clusterA, clusterB, rootCluster } = createRightTree();
			rootCluster.removeFromTree(particleC);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(particleA);
			expect(clusterA.right).toBe(particleB);
			expect(particleA.parentCluster).toBe(clusterA);
			expect(particleB.parentCluster).toBe(clusterA);
			expect(particleC.parentCluster).toBe(null);
		});
		it('left of a left cluster', () => {
			const { particleA, particleB, particleC, clusterA, clusterB, rootCluster } = createLeftTree();
			rootCluster.removeFromTree(particleA);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(particleB);
			expect(clusterA.right).toBe(particleC);
			expect(particleB.parentCluster).toBe(clusterA);
			expect(particleC.parentCluster).toBe(clusterA);
			expect(particleA.parentCluster).toBe(null);
		});
		it('right of a left cluster', () => {
			const { particleA, particleB, particleC, clusterA, clusterB, rootCluster } = createLeftTree();
			rootCluster.removeFromTree(particleB);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(particleA);
			expect(clusterA.right).toBe(particleC);
			expect(particleA.parentCluster).toBe(clusterA);
			expect(particleC.parentCluster).toBe(clusterA);
			expect(particleB.parentCluster).toBe(null);
		});
		it('left of the root cluster', () => {
			const { particleA, particleB, cluster, rootCluster } = createOneLevelTree();
			rootCluster.removeFromTree(particleA);

			expect(rootCluster.root).toBe(particleB);
			expect(particleB.parentCluster).toBe(null);
			expect(particleA.parentCluster).toBe(null);
		});
		it('right of the root cluster', () => {
			const { particleA, particleB, cluster, rootCluster } = createOneLevelTree();
			rootCluster.removeFromTree(particleB);

			expect(rootCluster.root).toBe(particleA);
			expect(particleA.parentCluster).toBe(null);
			expect(particleB.parentCluster).toBe(null);
		});
		it('root', () => {
			const particle = new Particle(0, 0, type, 1);
			const rootCluster = new RootCluster();
			rootCluster.root = particle;
			rootCluster.removeFromTree(particle);

			expect(rootCluster.root).toBeNull();
		});
	});
});
