import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { ParticleInterface } from '../common/particle-interface';
import { SharedData, SharedBuffers } from '../common/shared-data';

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
	particleTypes = new Array(100);
	for (let i = 0; i < particleTypes.length; i++) {
		particleTypes[i] = new ParticleType(
			i,
			`rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
		);
	}

	config = {
		canvas: {
			width: 500,
			height: 400,
		},
		particles: {
			amount: 30000,
			radius: 2,
			types: particleTypes,
		},
	};

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
		for (let i = 0; i < sharedData.buffers.currentLength; i++) {
			context.fillStyle = particleTypes[sharedData.typeIndexes[i]].style;
			context.beginPath();
			context.arc(
				sharedData.positionsX[i],
				sharedData.positionsY[i],
				config.particles.radius,
				0,
				2 * Math.PI,
			);
			context.fill();
		}

		window.requestAnimationFrame(draw);
	}
	window.requestAnimationFrame(draw);
}
