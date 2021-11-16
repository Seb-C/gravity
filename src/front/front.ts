import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { SharedData, SharedBuffers } from '../common/shared-data';
import { ParticleTypeId } from '../common/particle-type';
import { WebGLRenderer } from './webgl-renderer';
import { MouseHandler } from './mouse-handler';
import { Engine} from './engine';

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
	particleTypes = new Array(100);
	config = {
		canvas: {
			width: 1000,
			height: 800,
		},
		particles: {
			texturePrecision: 64,
			amount: 1000,
			radius: 10,
			types: new Array(100),
		},
	};

	for (let i = 0; i < particleTypes.length; i++) {
		const particleTypeId = <ParticleTypeId>i;
		config.particles.types[i] = {
			id: particleTypeId,
		};
		particleTypes[i] = new ParticleType(
			particleTypeId,
			Math.random(),
			Math.random(),
			Math.random(),
		);
	}

	engineWorker.sendConfig(config);
}

function startRenderingProcess() {
	const canvas = document.createElement('canvas');
	canvas.width = config.canvas.width;
	canvas.height = config.canvas.height;
	document.body.appendChild(canvas);

	const webgl = new WebGLRenderer(config, particleTypes, sharedData, canvas);
	const mouseHandler = new MouseHandler(config, canvas, engineWorker);

	function processFrame() {
		webgl.draw();

		// Update the buffers asynchronously between the frames
		setTimeout(() => webgl.updateBuffers(), 0);

		window.requestAnimationFrame(processFrame);
	}
	window.requestAnimationFrame(processFrame);
}
