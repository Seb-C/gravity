import "jasmine";
import { TreeAble } from './root';
import { Cluster } from './cluster';
import { Body, bodiesDistanceCenter } from './body';

describe('Cluster', () => {
	describe('constructor', () => {
		it('calls updateProperties', () => {
			global.spyOn(Cluster.prototype, 'updateProperties');
			const cluster = new Cluster(<TreeAble>{}, <TreeAble>{}, null);
			expect(Cluster.prototype.updateProperties).toHaveBeenCalled();
			expect(cluster.positionX).not.toBe(NaN);
			expect(cluster.positionY).not.toBe(NaN);
			expect(cluster.radius).not.toBe(NaN);
			expect(cluster.mass).not.toBe(NaN);
		});
	});
	describe('createAndSetParents', () => {
		it('sets the parents', () => {
			const left = <TreeAble>{};
			const right = <TreeAble>{};
			const cluster = Cluster.createAndSetParents(left, right, null);
			expect(left.parentCluster).toEqual(cluster);
			expect(right.parentCluster).toEqual(cluster);
		});
	});
	describe('updateProperties', () => {
		it('sets the properties', () => {
			const cluster = new Cluster(<TreeAble>{ mass: 3 }, <TreeAble>{ mass: 3 }, null);
			global.spyOn(Cluster, 'computeBoundaries').and.returnValue({
				positionX: 1,
				positionY: 2,
				radius: 3,
			});
			cluster.updateProperties();
			expect(Cluster.computeBoundaries).toHaveBeenCalled();
			expect(cluster.positionX).toEqual(1);
			expect(cluster.positionY).toEqual(2);
			expect(cluster.radius).toEqual(3);
			expect(cluster.mass).toEqual(6);
		});
		it('updates parent if updated', () => {
			const parentCluster = new Cluster(<TreeAble>{}, <TreeAble>{}, null);
			const cluster = new Cluster(<TreeAble>{}, <TreeAble>{}, parentCluster);
			cluster.positionX = 1;
			cluster.positionY = 2;
			cluster.radius = 3;
			global.spyOn(parentCluster, 'updateProperties');
			global.spyOn(Cluster, 'computeBoundaries').and.returnValue({
				positionX: 4,
				positionY: 5,
				radius: 6,
			});
			cluster.updateProperties();
			expect(parentCluster.updateProperties).toHaveBeenCalled();
		});
		it('updates parent if mass changes', () => {
			const parentCluster = new Cluster(<TreeAble>{}, <TreeAble>{}, null);
			const cluster = new Cluster(<TreeAble>{ mass: 1 }, <TreeAble>{ mass: 1 }, parentCluster);
			cluster.positionX = 1;
			cluster.positionY = 2;
			cluster.radius = 3;
			cluster.mass = 1;
			global.spyOn(parentCluster, 'updateProperties');
			global.spyOn(Cluster, 'computeBoundaries').and.returnValue({
				positionX: 1,
				positionY: 2,
				radius: 3,
			});
			cluster.updateProperties();
			expect(parentCluster.updateProperties).toHaveBeenCalled();
		});
		it('does not update parent if not updated', () => {
			const parentCluster = new Cluster(<TreeAble>{}, <TreeAble>{}, null);
			const cluster = new Cluster(<TreeAble>{ mass: 2 }, <TreeAble>{ mass: 2 }, parentCluster);
			cluster.positionX = 1;
			cluster.positionY = 2;
			cluster.radius = 3;
			cluster.mass = 4;
			global.spyOn(parentCluster, 'updateProperties');
			global.spyOn(Cluster, 'computeBoundaries').and.returnValue({
				positionX: 1,
				positionY: 2,
				radius: 3,
			});
			cluster.updateProperties();
			expect(parentCluster.updateProperties).not.toHaveBeenCalled();
		});
	});
	describe('computeBoundaries', () => {
		it('both are inside the boundaries', () => {
			const left = <Body>{ positionX: 1, positionY: 2, radius: 3 };
			const right = <Body>{ positionX: 1, positionY: 2, radius: 3 };
			const boundaries = Cluster.computeBoundaries(left, right);
			expect(bodiesDistanceCenter(left, boundaries)+left.radius).toBeLessThanOrEqual(boundaries.radius);
			expect(bodiesDistanceCenter(right, boundaries)+right.radius).toBeLessThanOrEqual(boundaries.radius);
		});
	});
});
