import { SharedParticleType } from '../common/shared-particle-type';

// Must be a power of 2 for WebGL
// TODO put in config
export const TEXTURE_PRECISION = 64;

export class ParticleType {
	public shared: SharedParticleType;
	public image: HTMLCanvasElement;
	public webglTexture?: WebGLTexture;

	constructor(
		shared: SharedParticleType,
		radius: number,
		style: string | CanvasGradient | CanvasPattern,
	) {
		this.shared = shared;

		this.image = document.createElement('canvas');
		this.image.width = TEXTURE_PRECISION;
		this.image.height = TEXTURE_PRECISION;

		const context = this.image.getContext('2d')!;
		if (!context) {
			throw new Error('Got a null context from the canvas.');
		}

		context.fillStyle = style;
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

	createWebGLTexture(webgl: WebGLRenderingContext) {
		this.webglTexture = webgl.createTexture()!;
		webgl.bindTexture(webgl.TEXTURE_2D, this.webglTexture);
		webgl.texImage2D(
			webgl.TEXTURE_2D,
			0,
			webgl.RGBA,
			webgl.RGBA,
			webgl.UNSIGNED_BYTE,
			this.image,
		);
		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
	}
}
