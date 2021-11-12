import { Config } from '../common/config';
import { ParticleType } from './particle-type';
import { ParticleInterface } from '../common/particle-interface';

let particles: ParticleInterface[] = [];

const engine = new Worker('./static/engine.js');
engine.addEventListener('message', (event: MessageEvent) => {
	switch (event.data?.type) {
		case 'ready':
			init();
			return;
		case 'particles':
			particles = event.data.particles;
			return;
		default:
			throw new Error(`Unknown message type ${event.data?.type} received by front.`);
	}
});

function init() {
	const particleTypes = new Array(100);
	for (let i = 0; i < particleTypes.length; i++) {
		particleTypes[i] = new ParticleType(
			i,
			`rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
		);
	}

	const config: Config = {
		canvas: {
			width: 500,
			height: 400,
		},
		particles: {
			amount: 3000,
			radius: 5,
			types: particleTypes,
		},
	};

	const canvas = document.createElement('canvas');
	canvas.width = config.canvas.width;
	canvas.height = config.canvas.height;
	document.body.appendChild(canvas);

	engine.postMessage({ type: 'config', config });

	const context = canvas.getContext('2d')!;
	if (!context) {
		throw new Error('Got a null context from the canvas.');
	}

	function draw () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i];
			const particleType = particleTypes[particle.typeIndex];

			context.fillStyle = particleType.style;
			context.beginPath();
			context.arc(
				particle.positionX,
				particle.positionY,
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
