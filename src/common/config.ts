import { ParticleType } from './particle-type';

export interface Config {
	canvas: {
		width: number,
		height: number,
	},
	particles: {
		texturePrecision: number, // Must be a power of 2 for WebGL
		radius: number,
		amount: number,
		types: ParticleType[],
	},
}
