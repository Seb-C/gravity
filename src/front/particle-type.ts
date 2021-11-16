import { Config } from '../common/config';
import { ParticleTypeId } from '../common/particle-type';

export class ParticleType {
	public id: ParticleTypeId;
	public colorRed: number;
	public colorGreen: number;
	public colorBlue: number;

	constructor(
		id: ParticleTypeId,
		colorRed: number,
		colorGreen: number,
		colorBlue: number,
	) {
		this.id = id;
		this.colorRed = colorRed;
		this.colorGreen = colorGreen;
		this.colorBlue = colorBlue;
	}

	static createTexture(window: Window, config: Config): HTMLCanvasElement {
		const canvasTexture = window.document.createElement('canvas');
		canvasTexture.width = config.particles.texturePrecision;
		canvasTexture.height = config.particles.texturePrecision;

		const context = canvasTexture.getContext('2d')!;
		if (!context) {
			throw new Error('Got a null context from the canvas.');
		}

		context.fillStyle = 'rgb(255, 255, 255)';
		context.beginPath();
		context.arc(
			config.particles.texturePrecision / 2,
			config.particles.texturePrecision / 2,
			config.particles.texturePrecision / 2,
			0,
			2 * Math.PI,
		);
		context.fill();

		return canvasTexture;
	}
}
