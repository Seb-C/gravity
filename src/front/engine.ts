import { Config } from '../common/config';
import { SharedBuffers } from '../common/shared-data';
import { ParticleId } from '../common/particle';

export type OnReadyCallback = () => void;
export type OnBuffersCallback = (buffers: SharedBuffers) => void;

// private
type OnParticleIdsResponseCallback = (ids: ParticleId[]) => void;

export class Engine {
	private worker: Worker;
	private onReadyCallback?: OnReadyCallback;
	private onBuffersCallback?: OnBuffersCallback;
	private onParticleIdsResponseCallback?: OnParticleIdsResponseCallback;

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
						this.onBuffersCallback(event.data.buffers);
						return;
					}
				case 'particleIdsResponse':
					if (this.onParticleIdsResponseCallback) {
						this.onParticleIdsResponseCallback(event.data.ids);
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

	public sendMoveParticle(id: ParticleId, positionX: number, positionY: number) {
		this.worker.postMessage({ type: 'moveParticle', id, positionX, positionY });
	}

	public sendConfig(config: Config) {
		this.worker.postMessage({ type: 'config', config });
	}

	public async getParticleIdsFromPosition(input: {
		positionX: number,
		positionY: number,
		radius: number,
	}): Promise<ParticleId[]> {
		return new Promise((resolve) => {
			this.onParticleIdsResponseCallback = (ids: ParticleId[]) => {
				resolve(ids);
				delete this.onParticleIdsResponseCallback;
			};

			this.worker.postMessage({
				type: 'getParticleIdsFromPosition',
				...input,
			});
		});
	}
}
