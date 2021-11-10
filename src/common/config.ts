import { ParticleType } from './particle-type';

export interface Config {
	canvas: {
		width: number,
		height: number,
	},
	particles: {
		radius: number,
		amount: number,
		types: ParticleType[],
	},
}
