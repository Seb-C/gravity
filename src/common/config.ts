import { ParticleType } from './particle-type';

export interface Config {
	canvas: {
		width: number,
		height: number,
	},
	particles: {
		amount: number,
		types: ParticleType[],
	},
}
