export type ParticleId = number & { __brand: Particle };

export interface Particle{
	id: ParticleId;
	positionX: number;
	positionY: number;
	typeId: number;
}
