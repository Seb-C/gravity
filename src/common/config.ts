import { ParticleType } from './particle-type';

export interface Config {
	canvas: {
		width: number,
		height: number,
	},
	particles: {
		displayRadius: number,
		amount: number,
		types: ParticleType[],
	},
}
