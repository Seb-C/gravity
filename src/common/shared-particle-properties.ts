import { ParticleType } from '../common/particle-type';

export class SharedParticleProperties {
	public positionX: number;
	public positionY: number;
	public typeIndex: number;

	constructor(
		positionX: number,
		positionY: number,
		type: ParticleType,
	) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.typeIndex = type.index;
	}
}
