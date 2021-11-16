import { Config } from '../common/config';
import { SharedBuffers } from '../common/shared-data';
import { ParticleId } from '../common/particle';

export type OnReadyCallback = () => void;
export type OnBuffersCallback = (buffers: SharedBuffers) => void;

// private
type OnParticleIdResponseCallback = (id: ParticleId|null) => void;

export class Engine {
	private worker: Worker;
	private onReadyCallback?: OnReadyCallback;
	private onBuffersCallback?: OnBuffersCallback;
	private onParticleIdResponseCallback?: OnParticleIdResponseCallback;

	constructor() {
		this.worker = new Worker('./static/engine.js');
		this.worker.addEventListener('message', (event: MessageEvent) => {
			switch (event.data?.type) {
				case 'ready':
					if (this.onReadyCallback) {
						this.onReadyCallback();
						return;
					}
				case 'buffers':
					if (this.onBuffersCallback) {
						this.onBuffersCallback(<SharedBuffers>event.data.buffers);
						return;
					}
				case 'particleIdResponse':
					if (this.onParticleIdResponseCallback) {
						this.onParticleIdResponseCallback(<ParticleId>event.data.id || null);
						return;
					}
				default:
					throw new Error(`No event handler defined for the message type ${event.data?.type} received by front.`);
			}
		});
	}

	public onReady(callback: OnReadyCallback) {
		this.onReadyCallback = callback;
	}

	public onBuffers(callback: OnBuffersCallback) {
		this.onBuffersCallback = callback;
	}

	public sendConfig(config: Config) {
		this.worker.postMessage({ type: 'config', config });
	}

	public async getParticleIdFromPosition(positionX: number, positionY: number): Promise<ParticleId|null> {
		return new Promise((resolve) => {
			this.onParticleIdResponseCallback = (id: ParticleId|null) => {
				resolve(id);
				delete this.onParticleIdResponseCallback;
			};

			this.worker.postMessage({
				type: 'getParticleIdFromPosition',
				positionX,
				positionY,
			});
		});
	}
}
