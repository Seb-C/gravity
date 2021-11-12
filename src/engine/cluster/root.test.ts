import "jasmine";
import { Cluster } from './cluster';
import { Root } from './root';
import { Node } from './node';
import { Particle } from '../particle';
import { ParticleType } from '../../common/particle-type';

describe('Root', () => {
	describe('removeFromTree', () => {
		const type: ParticleType = { index: 1 };

		const createLeftTree = () => {
			const nodeA = new Node(new Particle(0, 0, type, 1));
			const nodeB = new Node(new Particle(0, 0, type, 2));
			const nodeC = new Node(new Particle(0, 0, type, 3));

			const clusterB = Cluster.createAndSetParents(nodeA, nodeB, null);
			const clusterA = Cluster.createAndSetParents(clusterB, nodeC, null);

			const rootCluster = new Root();
			rootCluster.root = clusterA;

			return { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster };
		}
		const createRightTree = () => {
			const nodeA = new Node(new Particle(0, 0, type, 1));
			const nodeB = new Node(new Particle(0, 0, type, 2));
			const nodeC = new Node(new Particle(0, 0, type, 3));

			const clusterB = Cluster.createAndSetParents(nodeB, nodeC, null);
			const clusterA = Cluster.createAndSetParents(nodeA, clusterB, null);

			const rootCluster = new Root();
			rootCluster.root = clusterA;

			return { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster };
		}
		const createOneLevelTree = () => {
			const nodeA = new Node(new Particle(0, 0, type, 1));
			const nodeB = new Node(new Particle(0, 0, type, 2));

			const cluster = Cluster.createAndSetParents(nodeA, nodeB, null);

			const rootCluster = new Root();
			rootCluster.root = cluster;

			return { nodeA, nodeB, cluster, rootCluster };
		}

		it('left of a right cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createRightTree();
			rootCluster.removeFromTree(nodeB);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(nodeA);
			expect(clusterA.right).toBe(nodeC);
			expect(nodeA.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(clusterA);
			expect(nodeB.parentCluster).toBe(null);
		});
		it('right of a right cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createRightTree();
			rootCluster.removeFromTree(nodeC);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(nodeA);
			expect(clusterA.right).toBe(nodeB);
			expect(nodeA.parentCluster).toBe(clusterA);
			expect(nodeB.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(null);
		});
		it('left of a left cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createLeftTree();
			rootCluster.removeFromTree(nodeA);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(nodeB);
			expect(clusterA.right).toBe(nodeC);
			expect(nodeB.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(clusterA);
			expect(nodeA.parentCluster).toBe(null);
		});
		it('right of a left cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createLeftTree();
			rootCluster.removeFromTree(nodeB);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBe(null);
			expect(clusterA.left).toBe(nodeA);
			expect(clusterA.right).toBe(nodeC);
			expect(nodeA.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(clusterA);
			expect(nodeB.parentCluster).toBe(null);
		});
		it('left of the root cluster', () => {
			const { nodeA, nodeB, cluster, rootCluster } = createOneLevelTree();
			rootCluster.removeFromTree(nodeA);

			expect(rootCluster.root).toBe(nodeB);
			expect(nodeB.parentCluster).toBe(null);
			expect(nodeA.parentCluster).toBe(null);
		});
		it('right of the root cluster', () => {
			const { nodeA, nodeB, cluster, rootCluster } = createOneLevelTree();
			rootCluster.removeFromTree(nodeB);

			expect(rootCluster.root).toBe(nodeA);
			expect(nodeA.parentCluster).toBe(null);
			expect(nodeB.parentCluster).toBe(null);
		});
		it('root', () => {
			const node = new Node(new Particle(0, 0, type, 1));
			const rootCluster = new Root();
			rootCluster.root = node;
			rootCluster.removeFromTree(node);

			expect(rootCluster.root).toBeNull();
		});
	});
});
