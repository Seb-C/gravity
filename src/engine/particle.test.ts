import "jasmine";
import { ParticleType } from '../common/particle-type';
import { Particle, MIN_VELOCITY_PER_SECOND } from './particle';
import { ParticleId } from '../common/particle';

describe('Particle', () => {
	const createTestParticle = (positionX: number, positionY: number) => {
		const type = <ParticleType>{ id: 2 };
		const particle = new Particle(<ParticleId>1, positionX, positionY, type, 1);
		particle.decelerationRatePerSecond = 0;
		particle.velocityXPerSecond = 0;
		particle.velocityYPerSecond = 0;
		return particle;
	};
	describe('move', () => {
		describe('updates position from velocity', () => {
			it('to the top right', () => {
				const particle = createTestParticle(0, 0);
				particle.velocityXPerSecond = 1;
				particle.velocityYPerSecond = 2;
				particle.move(1);
				expect(particle.positionX).toBe(1);
				expect(particle.positionY).toBe(2);
			});
			it('to the bottom right', () => {
				const particle = createTestParticle(1, 2);
				particle.velocityXPerSecond = 1;
				particle.velocityYPerSecond = -1;
				particle.move(1);
				expect(particle.positionX).toBe(2);
				expect(particle.positionY).toBe(1);
			});
			it('to the bottom left', () => {
				const particle = createTestParticle(0.5, -1);
				particle.velocityXPerSecond = -2;
				particle.velocityYPerSecond = -1;
				particle.move(1);
				expect(particle.positionX).toBe(-1.5);
				expect(particle.positionY).toBe(-2);
			});
			it('to the top left', () => {
				const particle = createTestParticle(-3, 0);
				particle.velocityXPerSecond = -1;
				particle.velocityYPerSecond = 1;
				particle.move(1);
				expect(particle.positionX).toBe(-4);
				expect(particle.positionY).toBe(1);
			});
		});
		describe('translation depends on elapsed time', () => {
			it('elapsed < 1s', () => {
				const particle = createTestParticle(0, 0);
				particle.velocityXPerSecond = 1;
				particle.velocityYPerSecond = -2;
				particle.move(0.25);
				expect(particle.positionX).toBe(0.25);
				expect(particle.positionY).toBe(-0.5);
			});
			it('elapsed > 1s', () => {
				const particle = createTestParticle(0, 0);
				particle.velocityXPerSecond = 1;
				particle.velocityYPerSecond = -2;
				particle.move(1.5);
				expect(particle.positionX).toBe(1.5);
				expect(particle.positionY).toBe(-3);
			});
		});
		it('does not move if velocity is too small', () => {
			const particle = createTestParticle(1, 2);
			particle.velocityXPerSecond = MIN_VELOCITY_PER_SECOND / 2;
			particle.velocityYPerSecond = MIN_VELOCITY_PER_SECOND / 10;
			particle.move(0.5);
			expect(particle.positionX).toBe(1);
			expect(particle.positionY).toBe(2);
		});
		it('decelerates according to the defined rate', () => {
			const particle = createTestParticle(0, 0);
			particle.decelerationRatePerSecond = 0.8;
			particle.velocityXPerSecond = 1;
			particle.velocityYPerSecond = 2;
			particle.move(0.5);
			expect(particle.velocityXPerSecond).toBe(0.6);
			expect(particle.velocityYPerSecond).toBe(1.2);
		});
	});
	describe('setVelocityTowards', () => {
		it('top right', () => {
			const particle = createTestParticle(0, 0);
			particle.setVelocityTowards({ positionX: 1, positionY: 2}, 1);
			expect(particle.velocityXPerSecond).toEqual(1);
			expect(particle.velocityYPerSecond).toEqual(1);
		});
		it('bottom right', () => {
			const particle = createTestParticle(0, 0);
			particle.setVelocityTowards({ positionX: 1, positionY: -2}, 0.5);
			expect(particle.velocityXPerSecond).toEqual(0.5);
			expect(particle.velocityYPerSecond).toEqual(-0.5);
		});
		it('bottom left', () => {
			const particle = createTestParticle(0, 0);
			particle.setVelocityTowards({ positionX: -2, positionY: -1}, 1);
			expect(particle.velocityXPerSecond).toEqual(-1);
			expect(particle.velocityYPerSecond).toEqual(-1);
		});
		it('top left', () => {
			const particle = createTestParticle(0, 0);
			particle.setVelocityTowards({ positionX: -2, positionY: 1}, 0.5);
			expect(particle.velocityXPerSecond).toEqual(-0.5);
			expect(particle.velocityYPerSecond).toEqual(0.5);
		});
	});
});
