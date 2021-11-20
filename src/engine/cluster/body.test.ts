import "jasmine";
import { bodiesDoesCollide, bodiesDistanceCenter } from './body';

describe('Body', () => {
	const body = (positionX: number, positionY: number, radius: number) => ({
		positionX,
		positionY,
		radius,
	});
	describe('bodiesDoesCollide', () => {
		it('a on the left of b', () => {
			expect(bodiesDoesCollide(body(0, 0, 100), body(50, 0, 100))).toBe(true);
		});
		it('a on the right of b', () => {
			expect(bodiesDoesCollide(body(0, 0, 100), body(-50, 0, 100))).toBe(true);
		});
		it('a on top of b', () => {
			expect(bodiesDoesCollide(body(0, 50, 100), body(0, 0, 100))).toBe(true);
		});
		it('a below b', () => {
			expect(bodiesDoesCollide(body(0, -50, 100), body(0, 0, 100))).toBe(true);
		});
		it('different radius', () => {
			expect(bodiesDoesCollide(body(0, 0, 1), body(0, 99, 100))).toBe(true);
		});
		it('same object', () => {
			const sameBody = body(0, 0, 10);
			expect(bodiesDoesCollide(sameBody, sameBody)).toBe(false);
		});
		it('same position', () => {
			expect(bodiesDoesCollide(body(0, 0, 10), body(0, 0, 10))).toBe(true);
		});
		it('not colliding', () => {
			expect(bodiesDoesCollide(body(5, 5, 0.1), body(0, 0, 5))).toBe(false);
		});
	});

	describe('bodiesDistanceCenter', () => {
		it('a positive, b positive', () => {
			expect(bodiesDistanceCenter(body(1, 1, 5), body(4, 5, 10))).toBe(5);
		});
		it('a positive, b negative', () => {
			expect(bodiesDistanceCenter(body(1, 1, 5), body(-2, -3, 10))).toBe(5);
		});
		it('a negative, b negative', () => {
			expect(bodiesDistanceCenter(body(-5, -4, 5), body(-1, -1, 10))).toBe(5);
		});
		it('a negative, b positive', () => {
			expect(bodiesDistanceCenter(body(-2, -3, 5), body(1, 1, 10))).toBe(5);
		});
	});
});
