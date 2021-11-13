import { SharedParticleType } from './shared-particle-type';

export interface Config {
	canvas: {
		width: number,
		height: number,
	},
	particles: {
		radius: number,
		amount: number,
		types: SharedParticleType[],
	},
}
