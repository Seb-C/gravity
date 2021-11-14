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
			texturePrecision: 64,
			amount: 300,
			radius: 20,
			types: sharedParticleTypes,
		},
	};

	for (let i = 0; i < particleTypes.length; i++) {
		sharedParticleTypes[i] = new SharedParticleType(i);
		particleTypes[i] = new ParticleType(
			sharedParticleTypes[i],
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

	const vertexShaderScript = `
		#define particleTypesCount ${particleTypes.length}
		#define canvasWidth ${config.canvas.width/2}
		#define canvasHeight ${config.canvas.height/2}

		attribute float positionX;
		attribute float positionY;
		attribute float typeIndex;

		uniform vec3 particleTypeColors[particleTypesCount];

		varying mediump vec3 particleColor;

		void main(void) {
			gl_Position = vec4(positionX / float(canvasWidth), positionY / float(canvasHeight), 0.0, 1.0);
			gl_PointSize = float(${config.particles.radius*2});
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

	const gl = canvas.getContext("webgl")!;
	if (!gl) {
		throw new Error('Got a null webgl context from the canvas.');
	}

	const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vertexShader, vertexShaderScript);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(vertexShader) || "Error while compiling the vertex shader.");
	}

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(fragmentShader, fragmentShaderScript);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(fragmentShader) || "Error while compiling the fragment shader.");
	}

	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program) || "Error when creating the gl program");
	}
	gl.useProgram(program);

	ParticleType.createWebGLTexture(config, gl);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, ParticleType.webglTexture!);
	gl.uniform1i(gl.getUniformLocation(program, 'particleTexture'), 0);

	const particleTypeColors = new Float32Array(particleTypes.length*3);
	for (let i = 0; i < particleTypes.length; i++) {
		particleTypeColors[i*3+0] = particleTypes[i].colorRed;
		particleTypeColors[i*3+1] = particleTypes[i].colorGreen;
		particleTypeColors[i*3+2] = particleTypes[i].colorBlue;
	}
	const particleTypeColorsUniform = gl.getUniformLocation(program, "particleTypeColors");
	gl.uniform3fv(particleTypeColorsUniform, particleTypeColors);

	const positionXBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionXBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sharedData.positionsX, gl.STATIC_DRAW);
	const positionXAttribute = gl.getAttribLocation(program, "positionX");
	gl.enableVertexAttribArray(positionXAttribute);
	gl.vertexAttribPointer(positionXAttribute, 1, gl.FLOAT, false, 0, 0);

	const positionYBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionYBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sharedData.positionsY, gl.STATIC_DRAW);
	const positionYAttribute = gl.getAttribLocation(program, "positionY");
	gl.enableVertexAttribArray(positionYAttribute);
	gl.vertexAttribPointer(positionYAttribute, 1, gl.FLOAT, false, 0, 0);

	const typeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, typeIndexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sharedData.typeIndexes, gl.STATIC_DRAW);
	const typeIndexAttribute = gl.getAttribLocation(program, "typeIndex");
	gl.enableVertexAttribArray(typeIndexAttribute);
	gl.vertexAttribPointer(typeIndexAttribute, 1, gl.FLOAT, false, 0, 0);

	gl.clearColor(1, 1, 1, 1);
	gl.disable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	function draw () {
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.POINTS, 0, sharedData.buffers.currentLength);

		window.requestAnimationFrame(draw);
	}
	window.requestAnimationFrame(draw);
}
