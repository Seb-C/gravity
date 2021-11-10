import { Config } from '../common/config';
import { Particle } from './particle';
import { RootCluster } from './cluster';

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
	const rootCluster = new RootCluster();
	for (let i = 0; i < config.particles.amount; i++) {
		rootCluster.add(
			new Particle(
				config.canvas.width * Math.random(),
				config.canvas.height * Math.random(),
				config.particles.types[Math.floor(Math.random() * config.particles.types.length)],
				config.particles.radius,
			),
		);
	}

	let lastTick = +new Date();
	setInterval(() => {
		const thisTick = +new Date();
		const elapsedSeconds = (thisTick - lastTick) / 1000;
		rootCluster.tick(elapsedSeconds);
		lastTick = thisTick;

		postMessage({
			type: 'particles',
			particles: rootCluster.allParticles,
		});
	}, 5);
}
