import { Config } from '../common/config';
import { Particle } from './particle';
import { BuffersData, Buffers } from '../common/buffers';

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
	const buffers = new Buffers(new BuffersData(config.particles.amount));
	self.postMessage({ type: 'buffers', buffers: buffers.data });

	// TODO partition the space to optimize performance
	const particles = Array<Particle>(config.particles.amount);
	for (let i = 0; i < particles.length; i++) {
		particles[i] = new Particle(
			config.particles.types,
			buffers,
			i,
			config.particles.types[Math.floor(Math.random() * config.particles.types.length)],
			config.canvas.width * Math.random(),
			config.canvas.height * Math.random(),
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
	}, 5);
}
