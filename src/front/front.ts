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
			`rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
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

			context.drawImage(type.image, x - radius, y - radius);
		}

		window.requestAnimationFrame(draw);
	}
	window.requestAnimationFrame(draw);
}
