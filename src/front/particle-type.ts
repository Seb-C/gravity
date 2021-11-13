import { SharedParticleType } from '../common/shared-particle-type';

export class ParticleType {
	public shared: SharedParticleType;
	public image: CanvasImageSource;

	constructor(
		shared: SharedParticleType,
		radius: number,
		style: string | CanvasGradient | CanvasPattern,
	) {
		this.shared = shared;

		this.image = document.createElement('canvas');
		this.image.width = radius * 2;
		this.image.height = radius * 2;

		const context = this.image.getContext('2d')!;
		if (!context) {
			throw new Error('Got a null context from the canvas.');
		}

		context.fillStyle = style;
		context.beginPath();
		context.arc(radius, radius, radius, 0, 2 * Math.PI);
		context.fill();
	}
}
