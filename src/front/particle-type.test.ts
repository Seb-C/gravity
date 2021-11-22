import "jasmine";
import { ParticleType } from './particle-type';
import { ParticleTypeId } from '../common/particle-type';

describe('ParticleType', () => {
	describe('onlySharedProperties', () => {
		it('contains properties', () => {
			const id = <ParticleTypeId>1;
			const type = new ParticleType(<any>{ id, mass: 2 });
			expect(type.onlySharedProperties()).toEqual({ id, mass: 2 });
		});
		it('does not contain any other property', () => {
			const id = <ParticleTypeId>1;
			const type = new ParticleType(<any>{ id, mass: 2 });
			const keys = Object.keys(type.onlySharedProperties());
			expect(keys).toEqual(['id', 'mass']);
		});
	});
});
