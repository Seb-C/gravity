import { Config } from '../common/config';
import { SharedBuffers } from '../common/shared-data';

export type OnConfigCallback = (config: Config) => void;

type WorkerSelf = WorkerGlobalScope & typeof globalThis;

export class Front {
	private worker: WorkerSelf;
	private onConfigCallback?: OnConfigCallback;

	constructor(worker: WorkerSelf) {
		this.worker = worker;
		this.worker.addEventListener('message', (event: any) => {
			switch (event.data?.type) {
				case 'config':
					if (this.onConfigCallback) {
						this.onConfigCallback(<Config>event.data?.config);
						return;
					}
				case 'getParticleIndexFromPosition':
					console.log(event.data);
					// self.postMessage({ type: 'particleIndexResponse', index: 42|null });
					return;
				default:
					throw new Error(`No event handler defined for the message type ${event.data?.type} received by engine.`);
			}
		});
	}

	public onConfig(callback: OnConfigCallback) {
		this.onConfigCallback = callback;
	}

	public sendReady() {
		this.worker.postMessage({ type: 'ready' });
	}

	public sendBuffers(buffers: SharedBuffers) {
		this.worker.postMessage({ type: 'buffers', buffers });
	}
}
