import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { SharedData, SharedBuffers } from '../common/shared-data';
import { ParticleTypeId } from '../common/particle-type';
import { WebGLRenderer } from './webgl-renderer';
import { MouseHandler } from './mouse-handler';
import { Engine } from './engine';

let config: Config;
let sharedData: SharedData;
let particleTypes: ParticleType[];

const engineWorker = new Engine();
engineWorker.onReady(createConfig);
engineWorker.onBuffers((buffers: SharedBuffers) => {
	sharedData = new SharedData(buffers);
	startRenderingProcess();
});

function createConfig() {
	particleTypes = [
		new ParticleType(<ParticleTypeId>1, 0, 1, 0), // green
		new ParticleType(<ParticleTypeId>2, 1, 0.8, 0), // yellow
		new ParticleType(<ParticleTypeId>3, 1, 0, 0), // red
	];

	config = {
		canvas: {
			width: 1000,
			height: 800,
		},
		particles: {
			texturePrecision: 64,
			amount: 1000,
			radius: 10,
			types: particleTypes.map(type => ({ id: type.id })),
		},
		mouse: {
			searchRadius: 5,
			inducedVelocityPerSecond: 75,
		},
	};

	engineWorker.sendConfig(config);
}

function startRenderingProcess() {
	const canvas = window.document.createElement('canvas');
	canvas.width = config.canvas.width;
	canvas.height = config.canvas.height;
	document.body.appendChild(canvas);

	const webgl = new WebGLRenderer(config, particleTypes, sharedData, window, canvas);
	const mouseHandler = new MouseHandler(config, canvas, engineWorker);

	function processFrame() {
		webgl.draw();

		// Update the buffers asynchronously between the frames
		setTimeout(() => webgl.updateBuffers(), 0);

		window.requestAnimationFrame(processFrame);
	}
	window.requestAnimationFrame(processFrame);
}
