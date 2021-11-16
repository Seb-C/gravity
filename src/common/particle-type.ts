export type ParticleTypeId = number & { __brand: ParticleType };

export interface ParticleType {
	id: ParticleTypeId;
}
