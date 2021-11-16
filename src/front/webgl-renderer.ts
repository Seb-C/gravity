import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { SharedData } from '../common/shared-data';

export class WebGLRenderer {
	public config: Config;
	public particleTypes: ParticleType[];
	public sharedData: SharedData;
	public canvas: HTMLCanvasElement;

	public gl: WebGLRenderingContext;
	private vertexShader: WebGLShader;
	private fragmentShader: WebGLShader;
	private program: WebGLProgram;

	private positionXBuffer: WebGLBuffer;
	private positionYBuffer: WebGLBuffer;
	private typeIdBuffer: WebGLBuffer;

	private particleTexture: WebGLTexture;

	constructor(
		config: Config,
		particleTypes: ParticleType[],
		sharedData: SharedData,
		canvas: HTMLCanvasElement,
	) {
		this.config = config;
		this.particleTypes = particleTypes;
		this.sharedData = sharedData;
		this.canvas = canvas;

		this.gl = this.setupWebGL();
		this.vertexShader = this.createVertexShader();
		this.fragmentShader = this.createFragmentShader();
		this.program = this.createProgram();

		this.positionXBuffer = this.createPositionXBuffer();
		this.positionYBuffer = this.createPositionYBuffer();
		this.typeIdBuffer = this.createTypeIndexBuffer();

		this.particleTexture = this.createParticleTexture();
		this.setupParticleTypes();
	}

	public draw() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.POINTS, 0, this.sharedData.buffers.currentLength);
	}

	public updateBuffers() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionXBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sharedData.positionsX, this.gl.DYNAMIC_DRAW);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionYBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sharedData.positionsY, this.gl.DYNAMIC_DRAW);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.typeIdBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sharedData.typeIds, this.gl.DYNAMIC_DRAW);
	}

	private setupWebGL(): WebGLRenderingContext {
		const gl = this.canvas.getContext("webgl")!;
		if (!gl) {
			throw new Error('Got a null webgl context from the canvas.');
		}

		gl.clearColor(1, 1, 1, 1);
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		return gl;
	}

	private createVertexShader(): WebGLShader {
		const vertexShaderScript = `
			#define particleTypesCount ${this.particleTypes.length}
			#define canvasWidth ${this.config.canvas.width/2}
			#define canvasHeight ${this.config.canvas.height/2}

			attribute float positionX;
			attribute float positionY;
			attribute float typeId;

			uniform vec3 particleTypeColors[particleTypesCount];

			varying mediump vec3 particleColor;

			void main(void) {
				gl_Position = vec4(positionX / float(canvasWidth), positionY / float(canvasHeight), 0.0, 1.0);
				gl_PointSize = float(${this.config.particles.radius*2});
				particleColor = particleTypeColors[int(typeId)];
			}
		`;

		const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
		this.gl.shaderSource(vertexShader, vertexShaderScript);
		this.gl.compileShader(vertexShader);
		if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
			throw new Error(this.gl.getShaderInfoLog(vertexShader) || "Error while compiling the vertex shader.");
		}

		return vertexShader;
	}

	private createFragmentShader(): WebGLShader {
		const fragmentShaderScript = `
			uniform sampler2D particleTexture;
			varying mediump vec3 particleColor;

			void main(void) {
				gl_FragColor = vec4(particleColor, 1.0) * texture2D(particleTexture, gl_PointCoord);
			}
		`;

		const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
		this.gl.shaderSource(fragmentShader, fragmentShaderScript);
		this.gl.compileShader(fragmentShader);
		if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
			throw new Error(this.gl.getShaderInfoLog(fragmentShader) || "Error while compiling the fragment shader.");
		}

		return fragmentShader;
	}

	private createProgram(): WebGLProgram {
		const program = this.gl.createProgram()!;
		this.gl.attachShader(program, this.vertexShader);
		this.gl.attachShader(program, this.fragmentShader);
		this.gl.linkProgram(program);
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			throw new Error(this.gl.getProgramInfoLog(program) || "Error when creating the this.gl program");
		}
		this.gl.useProgram(program);

		return program;
	}

	private createParticleTexture(): WebGLTexture {
		const textureCanvas = ParticleType.createTexture(this.config);

		const texture = this.gl.createTexture()!;
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			textureCanvas,
		);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'particleTexture'), 0);

		return texture;
	}

	private setupParticleTypes() {
		const particleTypeColors = new Float32Array(this.particleTypes.length*3);
		for (let i = 0; i < this.particleTypes.length; i++) {
			particleTypeColors[i*3+0] = this.particleTypes[i].colorRed;
			particleTypeColors[i*3+1] = this.particleTypes[i].colorGreen;
			particleTypeColors[i*3+2] = this.particleTypes[i].colorBlue;
		}
		const particleTypeColorsUniform = this.gl.getUniformLocation(this.program, "particleTypeColors");
		this.gl.uniform3fv(particleTypeColorsUniform, particleTypeColors);
	}

	private createPositionXBuffer(): WebGLBuffer {
		const positionXBuffer = this.gl.createBuffer()!;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionXBuffer);
		const positionXAttribute = this.gl.getAttribLocation(this.program, "positionX");
		this.gl.enableVertexAttribArray(positionXAttribute);
		this.gl.vertexAttribPointer(positionXAttribute, 1, this.gl.FLOAT, false, 0, 0);

		return positionXBuffer;
	}

	private createPositionYBuffer(): WebGLBuffer {
		const positionYBuffer = this.gl.createBuffer()!;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionYBuffer);
		const positionYAttribute = this.gl.getAttribLocation(this.program, "positionY");
		this.gl.enableVertexAttribArray(positionYAttribute);
		this.gl.vertexAttribPointer(positionYAttribute, 1, this.gl.FLOAT, false, 0, 0);

		return positionYBuffer;
	}

	private createTypeIndexBuffer(): WebGLBuffer {
		const typeIdBuffer = this.gl.createBuffer()!;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, typeIdBuffer);
		const typeIdAttribute = this.gl.getAttribLocation(this.program, "typeId");
		this.gl.enableVertexAttribArray(typeIdAttribute);
		this.gl.vertexAttribPointer(typeIdAttribute, 1, this.gl.FLOAT, false, 0, 0);

		return typeIdBuffer;
	}
}
