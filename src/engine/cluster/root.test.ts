import "jasmine";
import { Cluster } from './cluster';
import { Root, TreeAble } from './root';
import { Node } from './node';
import { Particle } from '../particle';
import { ParticleType, ParticleTypeId } from '../../common/particle-type';
import { SharedBuffers, SharedData } from '../../common/shared-data';
import { ParticleId } from '../../common/particle';

describe('Root', () => {
	describe('add', () => {
		it('adds and sets the required variables', () => {
			const sharedData = jasmine.createSpyObj('sharedData', ['set']);
			const rootCluster = new Root(sharedData);
			const particle = new Particle(<ParticleId>1, 10, 0, <any>{}, 10);
			global.spyOn(rootCluster, 'addToTree');
			rootCluster.add(0, particle);
			expect(sharedData.set).toHaveBeenCalledWith(0, particle);
			expect(rootCluster.allNodes.length).toBe(1);
			expect(rootCluster.allNodes[0].particle).toBe(particle);
			expect(rootCluster.particlesById.get(particle.id)).toBe(particle);
			expect(rootCluster.addToTree).toHaveBeenCalledWith(new Node(particle));
		});
	});
	describe('addToTree', () => {
		const createTestTree = () => {
			const sharedData = jasmine.createSpyObj('sharedData', ['set']);
			const rootCluster = new Root(sharedData);

			const nodeA = new Node(new Particle(<ParticleId>1, -10, 0, <any>{}, 1));
			const nodeB = new Node(new Particle(<ParticleId>2, 10, 10, <any>{}, 1));
			const nodeC = new Node(new Particle(<ParticleId>3, 10, -10, <any>{}, 1));

			const clusterB = Cluster.createAndSetParents(nodeB, nodeC, null);
			const clusterA = Cluster.createAndSetParents(nodeA, clusterB, null);

			rootCluster.root = clusterA;

			return { rootCluster, clusterA, clusterB, nodeA, nodeB, nodeC };
		};
		it('no existing root', () => {
			const rootCluster = new Root(<any>{});
			const node = new Node(new Particle(<ParticleId>1, 0, 0, <any>{}, 1));
			rootCluster.addToTree(node);
			expect(rootCluster.root).toBe(node);
		});
		it('existing root is a node', () => {
			const rootCluster = new Root(<any>{});
			const existingNode = new Node(new Particle(<ParticleId>1, 0, 0, <any>{}, 1));
			const nodeToAdd = new Node(new Particle(<ParticleId>2, 0, 0, <any>{}, 1));
			rootCluster.root = <TreeAble>existingNode;
			rootCluster.addToTree(nodeToAdd);
			expect(rootCluster.root).toBeInstanceOf(Cluster);
			expect((<Cluster>rootCluster.root).left).toBe(existingNode);
			expect((<Cluster>rootCluster.root).right).toBe(nodeToAdd);
			expect(existingNode.parentCluster).toBe(<Cluster>rootCluster.root);
			expect(nodeToAdd.parentCluster).toBe(<Cluster>rootCluster.root);
			expect(nodeToAdd.parentCluster).toBe(<Cluster>rootCluster.root);
		});
		it('add to the closest place, to the right', () => {
			const { rootCluster, clusterB, nodeB } = createTestTree();
			const nodeToAdd = new Node(new Particle(<ParticleId>4, 10, 9, <any>{}, 1));
			rootCluster.addToTree(nodeToAdd);

			expect(clusterB.left).toBeInstanceOf(Cluster);
			expect((<Cluster>clusterB.left).left).toBe(nodeB);
			expect((<Cluster>clusterB.left).right).toBe(nodeToAdd);
			expect(nodeB.parentCluster).toBe(<Cluster>clusterB.left);
			expect(nodeToAdd.parentCluster).toBe(<Cluster>clusterB.left);
		});
		it('add to the closest place, to the left', () => {
			const { rootCluster, clusterB, nodeC } = createTestTree();
			const nodeToAdd = new Node(new Particle(<ParticleId>4, 10, -9, <any>{}, 1));
			rootCluster.addToTree(nodeToAdd);

			expect(clusterB.right).toBeInstanceOf(Cluster);
			expect((<Cluster>clusterB.right).left).toBe(nodeC);
			expect((<Cluster>clusterB.right).right).toBe(nodeToAdd);
			expect(nodeC.parentCluster).toBe(<Cluster>clusterB.right);
			expect(nodeToAdd.parentCluster).toBe(<Cluster>clusterB.right);
		});
	});
	describe('removeFromTree', () => {
		const type: ParticleType = { id: <ParticleTypeId>1, mass: 1 };
		const mockedSharedData: SharedData = <any>{};

		const createLeftTree = () => {
			const nodeA = new Node(new Particle(<ParticleId>1, 0, 0, type, 1));
			const nodeB = new Node(new Particle(<ParticleId>2, 0, 0, type, 2));
			const nodeC = new Node(new Particle(<ParticleId>3, 0, 0, type, 3));

			const clusterB = Cluster.createAndSetParents(nodeA, nodeB, null);
			const clusterA = Cluster.createAndSetParents(clusterB, nodeC, null);

			const rootCluster = new Root(mockedSharedData);
			rootCluster.root = clusterA;

			return { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster };
		}
		const createRightTree = () => {
			const nodeA = new Node(new Particle(<ParticleId>1, 0, 0, type, 1));
			const nodeB = new Node(new Particle(<ParticleId>2, 0, 0, type, 2));
			const nodeC = new Node(new Particle(<ParticleId>3, 0, 0, type, 3));

			const clusterB = Cluster.createAndSetParents(nodeB, nodeC, null);
			const clusterA = Cluster.createAndSetParents(nodeA, clusterB, null);

			const rootCluster = new Root(mockedSharedData);
			rootCluster.root = clusterA;

			return { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster };
		}
		const createOneLevelTree = () => {
			const nodeA = new Node(new Particle(<ParticleId>1, 0, 0, type, 1));
			const nodeB = new Node(new Particle(<ParticleId>2, 0, 0, type, 2));

			const cluster = Cluster.createAndSetParents(nodeA, nodeB, null);

			const rootCluster = new Root(mockedSharedData);
			rootCluster.root = cluster;

			return { nodeA, nodeB, cluster, rootCluster };
		}

		it('left of a right cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createRightTree();
			rootCluster.removeFromTree(nodeB);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBeNull();
			expect(clusterA.left).toBe(nodeA);
			expect(clusterA.right).toBe(nodeC);
			expect(nodeA.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(clusterA);
			expect(nodeB.parentCluster).toBeNull();
		});
		it('right of a right cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createRightTree();
			rootCluster.removeFromTree(nodeC);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBeNull();
			expect(clusterA.left).toBe(nodeA);
			expect(clusterA.right).toBe(nodeB);
			expect(nodeA.parentCluster).toBe(clusterA);
			expect(nodeB.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBeNull();
		});
		it('left of a left cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createLeftTree();
			rootCluster.removeFromTree(nodeA);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBeNull();
			expect(clusterA.left).toBe(nodeB);
			expect(clusterA.right).toBe(nodeC);
			expect(nodeB.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(clusterA);
			expect(nodeA.parentCluster).toBeNull();
		});
		it('right of a left cluster', () => {
			const { nodeA, nodeB, nodeC, clusterA, clusterB, rootCluster } = createLeftTree();
			rootCluster.removeFromTree(nodeB);

			expect(rootCluster.root).toBe(clusterA);
			expect(clusterA.parentCluster).toBeNull();
			expect(clusterA.left).toBe(nodeA);
			expect(clusterA.right).toBe(nodeC);
			expect(nodeA.parentCluster).toBe(clusterA);
			expect(nodeC.parentCluster).toBe(clusterA);
			expect(nodeB.parentCluster).toBeNull();
		});
		it('left of the root cluster', () => {
			const { nodeA, nodeB, cluster, rootCluster } = createOneLevelTree();
			rootCluster.removeFromTree(nodeA);

			expect(rootCluster.root).toBe(nodeB);
			expect(nodeB.parentCluster).toBeNull();
			expect(nodeA.parentCluster).toBeNull();
		});
		it('right of the root cluster', () => {
			const { nodeA, nodeB, cluster, rootCluster } = createOneLevelTree();
			rootCluster.removeFromTree(nodeB);

			expect(rootCluster.root).toBe(nodeA);
			expect(nodeA.parentCluster).toBeNull();
			expect(nodeB.parentCluster).toBeNull();
		});
		it('root', () => {
			const node = new Node(new Particle(<ParticleId>1, 0, 0, type, 1));
			const rootCluster = new Root(mockedSharedData);
			rootCluster.root = node;
			rootCluster.removeFromTree(node);

			expect(rootCluster.root).toBeNull();
		});
	});
	describe('searchCollision', () => {
		const createTestTree = () => {
			const sharedData = jasmine.createSpyObj('sharedData', ['set']);
			const rootCluster = new Root(sharedData);

			const nodeA = new Node(new Particle(<ParticleId>1, 0, 10, <any>{}, 1));
			const nodeB = new Node(new Particle(<ParticleId>2, -5, 0, <any>{}, 10));
			const nodeC = new Node(new Particle(<ParticleId>2, 5, 0, <any>{}, 10));

			const clusterB = Cluster.createAndSetParents(nodeB, nodeC, null);
			const clusterA = Cluster.createAndSetParents(clusterB, nodeA, null);
			rootCluster.root = clusterA;

			return { rootCluster, clusterA, clusterB, nodeA, nodeB, nodeC };
		};
		it('is root', () => {
			const rootCluster = new Root(<any>{});
			const particle = new Particle(<ParticleId>1, 0, 0, <any>{}, 1);
			const node = new Node(particle);
			rootCluster.root = node;
			expect(rootCluster.searchCollision(particle).length).toBe(0);
		});
		it('root is node, collides', () => {
			const rootCluster = new Root(<any>{});
			const existingNode = new Node(new Particle(<ParticleId>1, 0, 0, <any>{}, 1));
			rootCluster.root = existingNode;

			const particle = new Particle(<ParticleId>1, 1, 1, <any>{}, 1);
			expect(rootCluster.searchCollision(particle)).toEqual([existingNode]);
		});
		it('root is node, does not collides', () => {
			const rootCluster = new Root(<any>{});
			const existingNode = new Node(new Particle(<ParticleId>1, 0, 0, <any>{}, 1));
			rootCluster.root = existingNode;

			const particle = new Particle(<ParticleId>1, 1, 1, <any>{}, 1);
			expect(rootCluster.searchCollision(particle)).toEqual([existingNode]);
		});
		it('collides with both', () => {
			const { rootCluster, nodeB, nodeC } = createTestTree();
			const particle = new Particle(<ParticleId>1, 0, 0, <any>{}, 1);
			expect(rootCluster.searchCollision(particle)).toEqual([nodeB, nodeC]);
		});
		it('collides with left only', () => {
			const { rootCluster, nodeB } = createTestTree();
			const particle = new Particle(<ParticleId>1, -7, 0, <any>{}, 1);
			expect(rootCluster.searchCollision(particle)).toEqual([nodeB]);
		});
		it('collides with right only', () => {
			const { rootCluster, nodeC } = createTestTree();
			const particle = new Particle(<ParticleId>1, 7, 0, <any>{}, 1);
			expect(rootCluster.searchCollision(particle)).toEqual([nodeC]);
		});
		it('collides with none', () => {
			const { rootCluster } = createTestTree();
			const particle = new Particle(<ParticleId>1, 0, -10, <any>{}, 1);
			expect(rootCluster.searchCollision(particle).length).toBe(0);
		});
	});
	describe('costOfAdding', () => {
		it('does not give the same result when adding the same radius', () => {
			const type: ParticleType = { id: <ParticleTypeId>1, mass: 1 };
			const existingNode1 = new Node(new Particle(<ParticleId>1, 0, 0, type, 10));
			const nodeToAdd1 = new Node(new Particle(<ParticleId>1, 10, 0, type, 10));

			const existingNode2 = new Node(new Particle(<ParticleId>1, 0, 0, type, 100));
			const nodeToAdd2 = new Node(new Particle(<ParticleId>1, 100, 0, type, 10));

			const rootCluster = new Root(<SharedData>{});

			const cost1 = rootCluster.costOfAdding(existingNode1, nodeToAdd1);
			const cost2 = rootCluster.costOfAdding(existingNode2, nodeToAdd2);

			expect(cost2).toBeGreaterThan(cost1);;
		});
	});
});
