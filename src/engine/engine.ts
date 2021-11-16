import { Config } from '../common/config';
import { Particle } from './particle';
import { Root } from './cluster/root';
import { Node } from './cluster/node';
import { SharedBuffers, SharedData } from '../common/shared-data';
import { ParticleId } from '../common/particle';

self.addEventListener('message', (event: any) => {
	switch (event.data?.type) {
		case 'config':
			init(event.data?.config);
			return;
		case 'getParticleIndexFromPosition':
			console.log(event.data);
			// self.postMessage({ type: 'particleIndexResponse', index: 42|null });
			return;
		default:
			throw new Error(`Unknown message type ${event.data?.type} received by engine.`);
	}
});

self.postMessage({ type: 'ready' });

function init(config: Config) {
	const sharedBuffers = new SharedBuffers(config.particles.amount);
	const sharedData = new SharedData(sharedBuffers);
	const rootCluster = new Root(sharedData);
	for (let i = 0; i < config.particles.amount; i++) {
		rootCluster.add(
			i,
			new Node(
				new Particle(
					<ParticleId>(i+1),
					config.canvas.width * Math.random() - (config.canvas.width / 2),
					config.canvas.height * Math.random() - (config.canvas.height / 2),
					config.particles.types[Math.floor(Math.random() * config.particles.types.length)],
					config.particles.radius,
				),
			),
		);
	}

	postMessage({
		type: 'buffers',
		buffers: sharedBuffers,
	});

	let lastTick = +new Date();
	setInterval(() => {
		const thisTick = +new Date();
		const elapsedSeconds = (thisTick - lastTick) / 1000;
		rootCluster.tick(elapsedSeconds);
		lastTick = thisTick;
	}, 5);
}
