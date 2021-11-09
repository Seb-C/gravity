import { Config } from '../common/config';

let particles: Array<{
	positionX: number,
	positionY: number,
	style: string,
}> = [];

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
	const config: Config = {
		canvas: {
			width: 500,
			height: 400,
		},
		particles: {
			amount: 3000,
			displayRadius: 5,
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
			context.fillStyle = particles[i].style;
			context.beginPath();
			context.arc(
				particles[i].positionX,
				particles[i].positionY,
				config.particles.displayRadius,
				0,
				2 * Math.PI,
			);
			context.fill();
		}

		window.requestAnimationFrame(draw);
	}
	window.requestAnimationFrame(draw);
}
