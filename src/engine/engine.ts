import { Config } from '../common/config';
import { Particle } from './particle';

self.addEventListener('message', (event: any) => {
	switch (event.data?.type) {
		case 'config':
			init(event.data?.config);
			return;
		default:
			throw new Error(`Unknown message type ${event.data?.type} received by engine.`);
	}
});

self.postMessage({ type: 'ready' });

function init(config: Config) {
	// TODO partition the space to optimize performance
	const particles = Array<Particle>(config.particles.amount);
	for (let i = 0; i < particles.length; i++) {
		particles[i] = new Particle(
			config.canvas.width * Math.random(),
			config.canvas.height * Math.random(),
			config.particles.types[Math.floor(Math.random() * config.particles.types.length)],
			config.particles.radius,
		);
	}

	let lastTick = +new Date();
	setInterval(() => {
		const thisTick = +new Date();
		const elapsedSeconds = (thisTick - lastTick) / 1000;
		for (let i = 0; i < particles.length; i++) {
			particles[i].tick(particles, elapsedSeconds);
		}
		lastTick = thisTick;

		postMessage({ type: 'particles', particles });
	}, 5);
}
