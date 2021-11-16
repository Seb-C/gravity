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
			const [clickX, clickY] = this.mouseEventToPosition(event);
			this.engine.getParticleIdFromPosition(clickX, clickY).then((particleId) => {
				this.selectedParticleId = particleId;
			});
		});
		this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
			console.log('move', event);
		});
		this.canvas.addEventListener('mouseup', (event: MouseEvent) => {
			console.log('up', event);
		});
	}

	mouseEventToPosition(event: MouseEvent) {
		const { width, height } = this.config.canvas;
		return [
			event.offsetX - (width / 2),
			(height - event.offsetY) - (height / 2),
		];
	};
}
