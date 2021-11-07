import { Particle } from './particle';

const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 400;
document.body.appendChild(canvas);

const context = canvas.getContext('2d');
if (!context) {
	throw new Error('Got a null context from the canvas.');
}

const particles = Array<Particle>(300);
for (let i = 0; i < particles.length; i++) {
	particles[i] = new Particle(
		canvas.width * Math.random(),
		canvas.height * Math.random(),
		`rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
	);
}

setInterval(() => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < particles.length; i++) {
		context.fillStyle = particles[i].style;
		context.beginPath();
		context.arc(
			particles[i].x,
			particles[i].y,
			Particle.size,
			0,
			2 * Math.PI,
		);
		context.fill();
	}
}, 1000 / 30);
