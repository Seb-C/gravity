import { SharedParticleType } from '../common/shared-particle-type';

// Must be a power of 2 for WebGL
// TODO put in config
export const TEXTURE_PRECISION = 64;

export class ParticleType {
	public shared: SharedParticleType;
	public image: HTMLCanvasElement; // TODO remove
	public colorRed: number;
	public colorGreen: number;
	public colorBlue: number;

	constructor(
		shared: SharedParticleType,
		radius: number,
		colorRed: number,
		colorGreen: number,
		colorBlue: number,
	) {
		this.shared = shared;
		this.colorRed = colorRed;
		this.colorGreen = colorGreen;
		this.colorBlue = colorBlue;

		this.image = document.createElement('canvas');
		this.image.width = TEXTURE_PRECISION;
		this.image.height = TEXTURE_PRECISION;

		const context = this.image.getContext('2d')!;
		if (!context) {
			throw new Error('Got a null context from the canvas.');
		}

		context.fillStyle = `rgb(${this.colorRed*255}, ${this.colorGreen*255}, ${this.colorBlue*255})`;
		context.beginPath();
		context.arc(
			TEXTURE_PRECISION / 2,
			TEXTURE_PRECISION / 2,
			TEXTURE_PRECISION / 2,
			0,
			2 * Math.PI,
		);
		context.arc
		context.fill();
	}

	public static canvasTexture?: HTMLCanvasElement;
	public static webglTexture?: WebGLTexture;
	static createWebGLTexture(webgl: WebGLRenderingContext) {
		ParticleType.canvasTexture = document.createElement('canvas');
		ParticleType.canvasTexture.width = TEXTURE_PRECISION;
		ParticleType.canvasTexture.height = TEXTURE_PRECISION;

		const context = ParticleType.canvasTexture.getContext('2d')!;
		if (!context) {
			throw new Error('Got a null context from the canvas.');
		}

		context.fillStyle = 'rgb(255, 255, 255)';
		context.beginPath();
		context.arc(
			TEXTURE_PRECISION / 2,
			TEXTURE_PRECISION / 2,
			TEXTURE_PRECISION / 2,
			0,
			2 * Math.PI,
		);
		context.fill();

		ParticleType.webglTexture = webgl.createTexture()!;
		webgl.bindTexture(webgl.TEXTURE_2D, ParticleType.webglTexture);
		webgl.texImage2D(
			webgl.TEXTURE_2D,
			0,
			webgl.RGBA,
			webgl.RGBA,
			webgl.UNSIGNED_BYTE,
			ParticleType.canvasTexture,
		);
		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
	}
}
