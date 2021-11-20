export interface Body {
	positionX: number;
	positionY: number;
	radius: number;
}

export function bodiesDoesCollide(a: Body, b: Body): boolean {
	if (a === b) {
		return false;
	}

	const distance = bodiesDistanceCenter(a, b);
	if (distance >= (a.radius + b.radius)) {
		return false
	}

	return true;
};

export function bodiesDistanceCenter(a: Body, b: Body): number {
	const deltaX = a.positionX - b.positionX;
	const deltaY = a.positionY - b.positionY;
	return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
