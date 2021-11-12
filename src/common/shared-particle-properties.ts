import { ParticleType } from '../common/particle-type';

export class SharedParticleProperties {
	public positionX: number;
	public positionY: number;
	public radius: number;
	public typeIndex: number;

	constructor(
		positionX: number,
		positionY: number,
		radius: number,
		type: ParticleType,
	) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.radius = radius;
		this.typeIndex = type.index;
	}
}
