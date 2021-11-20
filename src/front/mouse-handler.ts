import { Config } from '../common/config';
import { Engine } from './engine';
import { ParticleId } from '../common/particle';

export class MouseHandler {
	private config: Config;
	private canvas: HTMLCanvasElement;
	private engine: Engine;
	private selectedParticleId: ParticleId|null;

	constructor(
		config: Config,
		canvas: HTMLCanvasElement,
		engine: Engine,
	) {
		this.config = config;
		this.canvas = canvas;
		this.engine = engine;

		this.selectedParticleId = null;

		this.bindEvents();
	}

	bindEvents() {
		this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
			const { positionX, positionY } = this.mouseEventToPosition(event);
			const radius = this.config.mouse.searchRadius;
			this.engine
				.getParticleIdsFromPosition({ positionX, positionY, radius })
				.then((particleIds) => {
					this.selectedParticleId = particleIds[particleIds.length - 1] || null;
				});
		});
		this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
			if (this.selectedParticleId !== null) {
				const { positionX, positionY } = this.mouseEventToPosition(event);
				this.engine.sendMoveParticle(this.selectedParticleId, positionX, positionY);
			}
		});
		this.canvas.addEventListener('mouseup', (event: MouseEvent) => {
			this.selectedParticleId = null;
		});
	}

	mouseEventToPosition(event: MouseEvent) {
		const { width, height } = this.config.canvas;
		return {
			positionX: event.offsetX - (width / 2),
			positionY: (height - event.offsetY) - (height / 2),
		};
	};
}
