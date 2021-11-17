import { Config } from '../common/config';
import { SharedBuffers } from '../common/shared-data';
import { ParticleId } from '../common/particle';

export type OnConfigCallback = (config: Config) => void;
export type OnGetParticleIdsFromPositionCallback = (data: {
	positionX: number,
	positionY: number,
	radius: number,
}) => void;
export type OnMoveParticleCallback = (id: ParticleId, positionX: number, positionY: number) => void;

type WorkerSelf = WorkerGlobalScope & typeof globalThis;

export class Front {
	private worker: WorkerSelf;
	private onConfigCallback?: OnConfigCallback;
	private onGetParticleIdsFromPositionCallback?: OnGetParticleIdsFromPositionCallback;
	private onMoveParticleCallback?: OnMoveParticleCallback;

	constructor(worker: WorkerSelf) {
		this.worker = worker;
		this.worker.addEventListener('message', (event: any) => {
			switch (event.data?.type) {
				case 'config':
					if (this.onConfigCallback) {
						this.onConfigCallback(<Config>event.data?.config);
						return;
					}
				case 'getParticleIdsFromPosition':
					if (this.onGetParticleIdsFromPositionCallback) {
						this.onGetParticleIdsFromPositionCallback({
							positionX: <number>event.data?.positionX,
							positionY: <number>event.data?.positionY,
							radius: <number>event.data?.radius,
						});
						return;
					}
				case 'moveParticle':
					if (this.onMoveParticleCallback) {
						this.onMoveParticleCallback(
							<ParticleId>event.data?.id,
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

	public onGetParticleIdsFromPosition(callback: OnGetParticleIdsFromPositionCallback) {
		this.onGetParticleIdsFromPositionCallback = callback;
	}

	public onMoveParticle(callback: OnMoveParticleCallback) {
		this.onMoveParticleCallback = callback;
	}

	public sendReady() {
		this.worker.postMessage({ type: 'ready' });
	}

	public sendBuffers(buffers: SharedBuffers) {
		this.worker.postMessage({ type: 'buffers', buffers });
	}

	public sendParticleIdsResponse(ids: ParticleId[]) {
		this.worker.postMessage({ type: 'particleIdsResponse', ids });
	}
}
