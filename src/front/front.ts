import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { ParticleInterface } from '../common/particle-interface';
import { SharedData, SharedBuffers } from '../common/shared-data';
import { SharedParticleType } from '../common/shared-particle-type';
import { WebGLRenderer } from './webgl-renderer';

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
			width: 1000,
			height: 800,
		},
		particles: {
			texturePrecision: 64,
			amount: 10000,
			radius: 4,
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

	const webgl = new WebGLRenderer(
		config,
		particleTypes,
		sharedData,
		canvas,
	);

	function processFrame() {
		webgl.draw();

		// Update the buffers asynchronously between the frames
		setTimeout(() => webgl.updateBuffers(), 0);

		window.requestAnimationFrame(processFrame);
	}
	window.requestAnimationFrame(processFrame);
}
