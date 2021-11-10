import { ParticleType } from '../common/particle-type';
import { Config } from '../common/config';
import { Buffers } from '../common/buffers';

let config: Config;

const engine = new Worker('./static/engine.js');
engine.addEventListener('message', (event: MessageEvent) => {
	switch (event.data?.type) {
		case 'ready':
			config = createConfig();
			return;
		case 'buffers':
			const buffers = new Buffers(event.data.buffers);
			init(config, buffers);
			return;
		default:
			throw new Error(`Unknown message type ${event.data?.type} received by front.`);
	}
});

function createConfig(): Config {
	const types = new Array<ParticleType>(10);
	for (let i = 0; i < types.length; i++) {
		types[i] = new ParticleType(
			i,
			`rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
			5,
		);
	}

	const config: Config = {
		canvas: {
			width: 500,
			height: 400,
		},
		particles: {
			amount: 3000,
			types,
		},
	};

	engine.postMessage({ type: 'config', config });

	return config
}

function init(config: Config, buffers: Buffers) {
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
		for (let i = 0; i < config.particles.amount; i++) {
			const type = config.particles.types[buffers.types[i]];
			context.fillStyle = type.fillStyle;
			context.beginPath();
			context.arc(
				buffers.xPositions[i],
				buffers.yPositions[i],
				type.radius,
				0,
				2 * Math.PI,
			);
			context.fill();
		}

		window.requestAnimationFrame(draw);
	}
	window.requestAnimationFrame(draw);
}
