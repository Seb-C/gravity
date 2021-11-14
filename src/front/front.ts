import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { ParticleInterface } from '../common/particle-interface';
import { SharedData, SharedBuffers } from '../common/shared-data';
import { SharedParticleType } from '../common/shared-particle-type';

let config: Config;
let sharedData: SharedData;
let particleTypes: ParticleType[];

const engine = new Worker('./static/engine.js');
engine.addEventListener('message', (event: MessageEvent) => {
	switch (event.data?.type) {
		case 'ready':
			createConfig();
			return;
		case 'buffers':
			sharedData = new SharedData(<SharedBuffers>event.data.buffers);
			startRenderingProcess();
			return;
		default:
			throw new Error(`Unknown message type ${event.data?.type} received by front.`);
	}
});

function createConfig() {
	const sharedParticleTypes = new Array(100);
	particleTypes = new Array(100);
	config = {
		canvas: {
			width: 500,
			height: 400,
		},
		particles: {
			amount: 30000,
			radius: 2,
			types: sharedParticleTypes,
		},
	};

	for (let i = 0; i < particleTypes.length; i++) {
		sharedParticleTypes[i] = new SharedParticleType(i);
		particleTypes[i] = new ParticleType(
			sharedParticleTypes[i],
			config.particles.radius,
			Math.random(),
			Math.random(),
			Math.random(),
		);
	}

	engine.postMessage({ type: 'config', config });
}

function startRenderingProcess() {
	const canvas = document.createElement('canvas');
	canvas.width = config.canvas.width;
	canvas.height = config.canvas.height;
	document.body.appendChild(canvas);

	const context = canvas.getContext('2d')!;
	if (!context) {
		throw new Error('Got a null context from the canvas.');
	}

	function draw () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		const radius = config.particles.radius;
		for (let i = 0; i < sharedData.buffers.currentLength; i++) {
			const x = sharedData.positionsX[i];
			const y = sharedData.positionsY[i];
			const type = particleTypes[sharedData.typeIndexes[i]];

			context.drawImage(
				type.image,
				x - radius,
				y - radius,
				radius * 2,
				radius * 2,
			);
		}

		window.requestAnimationFrame(draw);
	}
	window.requestAnimationFrame(draw);













	const webglCanvas = document.createElement('canvas');
	webglCanvas.width = config.canvas.width;
	webglCanvas.height = config.canvas.height;
	document.body.appendChild(webglCanvas);

	// TODO uniform for point size
	// TODO translate particle position for display
	// TODO refresh buffers?

	const vertexShaderScript = `
		#define particleTypesCount ${particleTypes.length}
		attribute float positionX;
		attribute float positionY;
		attribute float typeIndex;

		uniform vec3 particleTypeColors[particleTypesCount];

		varying mediump vec3 particleColor;

		void main(void) {
			gl_Position = vec4(positionX, positionY, 0.0, 1.0);
			gl_PointSize = 10.0;
			particleColor = particleTypeColors[int(typeIndex)];
		}
	`;
	const fragmentShaderScript = `
		uniform sampler2D particleTexture;
		varying mediump vec3 particleColor;

		void main(void) {
			gl_FragColor = vec4(particleColor, 1.0) * texture2D(particleTexture, gl_PointCoord);
		}
	`;

	const webgl = webglCanvas.getContext("webgl")!;
	if (!webgl) {
		throw new Error('Got a null webgl context from the canvas.');
	}

	const vertexShader = webgl.createShader(webgl.VERTEX_SHADER)!;
	webgl.shaderSource(vertexShader, vertexShaderScript);
	webgl.compileShader(vertexShader);
	if (!webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS)) {
		throw new Error(webgl.getShaderInfoLog(vertexShader) || "Error while compiling the vertex shader.");
	}

	const fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER)!;
	webgl.shaderSource(fragmentShader, fragmentShaderScript);
	webgl.compileShader(fragmentShader);
	if (!webgl.getShaderParameter(fragmentShader, webgl.COMPILE_STATUS)) {
		throw new Error(webgl.getShaderInfoLog(fragmentShader) || "Error while compiling the fragment shader.");
	}

	const program = webgl.createProgram()!;
	webgl.attachShader(program, vertexShader);
	webgl.attachShader(program, fragmentShader);
	webgl.linkProgram(program);
	if (!webgl.getProgramParameter(program, webgl.LINK_STATUS)) {
		throw new Error(webgl.getProgramInfoLog(program) || "Error when creating the WebGL program");
	}
	webgl.useProgram(program);

	ParticleType.createWebGLTexture(webgl);
	webgl.activeTexture(webgl.TEXTURE0);
	webgl.bindTexture(webgl.TEXTURE_2D, ParticleType.webglTexture!);
	webgl.uniform1i(webgl.getUniformLocation(program, 'particleTexture'), 0);

	const particleTypeColors = new Float32Array(particleTypes.length*3);
	for (let i = 0; i < particleTypes.length; i++) {
		particleTypeColors[i*3+0] = particleTypes[i].colorRed;
		particleTypeColors[i*3+1] = particleTypes[i].colorGreen;
		particleTypeColors[i*3+2] = particleTypes[i].colorBlue;
	}
	const particleTypeColorsUniform = webgl.getUniformLocation(program, "particleTypeColors");
	webgl.uniform3fv(particleTypeColorsUniform, particleTypeColors);

	const positionXBuffer = webgl.createBuffer();
	webgl.bindBuffer(webgl.ARRAY_BUFFER, positionXBuffer);
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([-0.5, +0.5, 0.0]), webgl.STATIC_DRAW);
	const positionXAttribute = webgl.getAttribLocation(program, "positionX");
	webgl.enableVertexAttribArray(positionXAttribute);
	webgl.vertexAttribPointer(positionXAttribute, 1, webgl.FLOAT, false, 0, 0);

	const positionYBuffer = webgl.createBuffer();
	webgl.bindBuffer(webgl.ARRAY_BUFFER, positionYBuffer);
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.0]), webgl.STATIC_DRAW);
	const positionYAttribute = webgl.getAttribLocation(program, "positionY");
	webgl.enableVertexAttribArray(positionYAttribute);
	webgl.vertexAttribPointer(positionYAttribute, 1, webgl.FLOAT, false, 0, 0);

	const typeIndexBuffer = webgl.createBuffer();
	webgl.bindBuffer(webgl.ARRAY_BUFFER, typeIndexBuffer);
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([0, 1, 2]), webgl.STATIC_DRAW);
	const typeIndexAttribute = webgl.getAttribLocation(program, "typeIndex");
	webgl.enableVertexAttribArray(typeIndexAttribute);
	webgl.vertexAttribPointer(typeIndexAttribute, 1, webgl.FLOAT, false, 0, 0);

	webgl.drawArrays(webgl.POINTS, 0, 3);
}
