import "jasmine";
import { SharedData, SharedBuffers } from './shared-data';
import { Particle, ParticleId } from './particle';
import { ParticleTypeId } from './particle-type';

describe('SharedData', () => {
	describe('set', () => {
		it('changes only the right indexes', () => {
			const buffers = new SharedBuffers(3);
			const data = new SharedData(buffers);
			const particle: Particle = {
				id: <ParticleId>1,
				positionX: 2,
				positionY: 3,
				typeId: <ParticleTypeId>4,
			};
			data.set(1, particle);

			expect(data.positionsX[0]).toBe(0);
			expect(data.positionsX[1]).toBe(2);
			expect(data.positionsX[2]).toBe(0);

			expect(data.positionsY[0]).toBe(0);
			expect(data.positionsY[1]).toBe(3);
			expect(data.positionsY[2]).toBe(0);

			expect(data.typeIds[0]).toBe(0);
			expect(data.typeIds[1]).toBe(4);
			expect(data.typeIds[2]).toBe(0);
		});
	});
});
