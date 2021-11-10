import { ParticleType as ParticleTypeInterface } from '../common/particle-type';

export class ParticleType implements ParticleTypeInterface {
	constructor(
		public index: number,
		public style: string | CanvasGradient | CanvasPattern,
	) {}
}
