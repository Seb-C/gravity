import { Config } from '../common/config';
import { SharedBuffers } from '../common/shared-data';
import { ParticleId } from '../common/particle';

export type OnConfigCallback = (config: Config) => void;
export type OnGetParticleIdFromPositionCallback = (x: number, y: number) => void;

type WorkerSelf = WorkerGlobalScope & typeof globalThis;

export class Front {
	private worker: WorkerSelf;
	private onConfigCallback?: OnConfigCallback;
	private onGetParticleIdFromPositionCallback?: OnGetParticleIdFromPositionCallback;

	constructor(worker: WorkerSelf) {
		this.worker = worker;
		this.worker.addEventListener('message', (event: any) => {
			switch (event.data?.type) {
				case 'config':
					if (this.onConfigCallback) {
						this.onConfigCallback(<Config>event.data?.config);
						return;
					}
				case 'getParticleIdFromPosition':
					if (this.onGetParticleIdFromPositionCallback) {
						this.onGetParticleIdFromPositionCallback(
							<number>event.data?.positionX,
							<number>event.data?.positionY,
						);
						return;
					}
				default:
					throw new Error(`No event handler defined for the message type ${event.data?.type} received by engine.`);
			}
		});
	}

	public onConfig(callback: OnConfigCallback) {
		this.onConfigCallback = callback;
	}

	public onGetParticleIdFromPosition(callback: OnGetParticleIdFromPositionCallback) {
		this.onGetParticleIdFromPositionCallback = callback;
	}

	public sendReady() {
		this.worker.postMessage({ type: 'ready' });
	}

	public sendBuffers(buffers: SharedBuffers) {
		this.worker.postMessage({ type: 'buffers', buffers });
	}

	public sendParticleIdResponse(id: ParticleId|null) {
		this.worker.postMessage({ type: 'particleIdResponse', id });
	}
}
