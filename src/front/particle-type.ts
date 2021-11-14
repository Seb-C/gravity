import { Config } from '../common/config';
import { SharedParticleType } from '../common/shared-particle-type';

export class ParticleType {
	public shared: SharedParticleType;
	public colorRed: number;
	public colorGreen: number;
	public colorBlue: number;

	constructor(
		shared: SharedParticleType,
		colorRed: number,
		colorGreen: number,
		colorBlue: number,
	) {
		this.shared = shared;
		this.colorRed = colorRed;
		this.colorGreen = colorGreen;
		this.colorBlue = colorBlue;
	}

	public static canvasTexture?: HTMLCanvasElement;
	public static webglTexture?: WebGLTexture;
	static createWebGLTexture(config: Config, gl: WebGLRenderingContext) {
		ParticleType.canvasTexture = document.createElement('canvas');
		ParticleType.canvasTexture.width = config.particles.texturePrecision;
		ParticleType.canvasTexture.height = config.particles.texturePrecision;

		const context = ParticleType.canvasTexture.getContext('2d')!;
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

		ParticleType.webglTexture = gl.createTexture()!;
		gl.bindTexture(gl.TEXTURE_2D, ParticleType.webglTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			ParticleType.canvasTexture,
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}
