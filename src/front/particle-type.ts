import { Config } from '../common/config';
import { ParticleType as SharedParticleType, ParticleTypeId } from '../common/particle-type';

export class ParticleType {
	public id: ParticleTypeId;
	public colorRed: number;
	public colorGreen: number;
	public colorBlue: number;
	public mass: number;

	constructor(properties: {
		id: ParticleTypeId,
		colorRed: number,
		colorGreen: number,
		colorBlue: number,
		mass: number,
	}) {
		this.id = properties.id;
		this.colorRed = properties.colorRed;
		this.colorGreen = properties.colorGreen;
		this.colorBlue = properties.colorBlue;
		this.mass = properties.mass;
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

	public onlySharedProperties(): SharedParticleType {
		return {
			id: this.id,
			mass: this.mass,
		};
	}
}
