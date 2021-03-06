import { Config } from '../common/config';
import { Particle } from './particle';
import { Root } from './cluster/root';
import { Node } from './cluster/node';
import { SharedBuffers, SharedData } from '../common/shared-data';
import { ParticleId } from '../common/particle';
import { Front } from './front';

const front = new Front(self);
front.onConfig(init);
front.sendReady();

function init(config: Config) {
	const sharedBuffers = new SharedBuffers(config.particles.amount);
	const sharedData = new SharedData(sharedBuffers);
	const rootCluster = new Root(sharedData);
	for (let i = 0; i < config.particles.amount; i++) {
		rootCluster.add(i, new Particle(
			<ParticleId>(i+1),
			config.canvas.width * Math.random() - (config.canvas.width / 2),
			config.canvas.height * Math.random() - (config.canvas.height / 2),
			config.particles.types[Math.floor(Math.random() * config.particles.types.length)],
			config.particles.radius,
		));
	}

	front.sendBuffers(sharedBuffers);

	front.onGetParticleIdsFromPosition((data) => {
		const influences = rootCluster.searchInfluences(data);
		const particleIds = new Array<ParticleId>();
		for (let i = 0; i < influences.length; i++) {
			const influence = influences[i];
			if (influence instanceof Node) {
				particleIds.push(influence.particle.id);
			}
		}
		front.sendParticleIdsResponse(particleIds);
	});
	front.onMoveParticle((id, positionX, positionY) => {
		const particle = rootCluster.getParticleById(id);
		if (particle != null) {
			particle.setVelocityTowards(
				{ positionX, positionY },
				config.mouse.inducedVelocityPerSecond,
			);
		}
	});

	let lastTick = +new Date();
	setInterval(() => {
		const thisTick = +new Date();
		const elapsedSeconds = (thisTick - lastTick) / 1000;
		rootCluster.tick(elapsedSeconds);
		lastTick = thisTick;
	}, 5);
}
